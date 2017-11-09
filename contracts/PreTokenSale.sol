pragma solidity ^0.4.15;

import "./DataBrokerDaoToken.sol";
import "./SafeMath.sol";
import "./interfaces/Controlled.sol";


contract PreTokenSale is TokenController, Controlled {

    using SafeMath for uint256;

    uint256 public startFundingTime;
    uint256 public endFundingTime;
    
    uint256 constant public maximumFunding = 20000 ether;
    uint256 public tokensPerEther = 22222;
    uint256 constant public maxGasPrice = 50000000000;
    uint256 constant oneDay = 86400;
    uint256 public totalCollected = 0;
    bool    public paused;
    TNBToken public tokenContract;
    bool public finalized = false;
    bool public allowChange = true;
    bool private transfersEnabled = true;
    address private vaultAddress;

    bool private initialed = false;

    event Payment(address indexed _sender, uint256 _ethAmount, uint256 _tokenAmount);

    /**
     * @param _startFundingTime The UNIX time that the PreTokenSale will be able to start receiving funds
     * @param _endFundingTime   The UNIX time that the PreTokenSale will stop being able to receive funds
     * @param _vaultAddress     The address that will store the donated funds
     * @param _tokenAddress     Address of the token contract this contract controls
     */
    function PreTokenSale(
        uint _startFundingTime, 
        uint _endFundingTime, 
        address _vaultAddress,
        address _tokenAddress
    ) {
        require(_endFundingTime > now);
        require(_endFundingTime >= _startFundingTime);
        require(_vaultAddress != 0);
        require(_tokenAddress != 0);
        require(!initialed);

        startFundingTime = _startFundingTime;
        endFundingTime = _endFundingTime;
        vaultAddress = _vaultAddress;
        tokenContract = TNBToken(_tokenAddress);
        paused = false;
        initialed = true;
    }


    function setTime(uint time1, uint time2) onlyController {
        require(endFundingTime > now && startFundingTime < endFundingTime);
        startFundingTime = time1;
        endFundingTime = time2;
    }


    /**
     * @dev The fallback function is called when ether is sent to the contract, it simply calls `doPayment()` with the address that sent the ether as the `_owner`. Payable is a required solidity modifier for functions to receive ether, without this modifier functions will throw if ether is sent to them
     */
    function () payable notPaused {
        doPayment(msg.sender);
    }

    /**
     * @notice `proxyPayment()` allows the caller to send ether to the PreTokenSale and have the tokens created in an address of their choosing
     * @param _owner The address that will hold the newly created tokens
     */
    function proxyPayment(address _owner) payable notPaused returns(bool success) {
        return doPayment(_owner);
    }

    /**
    * @notice Notifies the controller about a transfer, for this PreTokenSale all transfers are allowed by default and no extra notifications are needed
    * @param _from The origin of the transfer
    * @param _to The destination of the transfer
    * @param _amount The amount of the transfer
    * @return False if the controller does not authorize the transfer
    */
    function onTransfer(address _from, address _to, uint _amount) returns(bool success) {
        if ( _from == vaultAddress || transfersEnabled) {
            return true;
        }
        return false;
    }

    /**
     * @notice Notifies the controller about an approval, for this PreTokenSale all
     * approvals are allowed by default and no extra notifications are needed
     * @param _owner The address that calls `approve()`
     * @param _spender The spender in the `approve()` call
     * @param _amount The amount in the `approve()` call
     * @return False if the controller does not authorize the approval
     */
    function onApprove(address _owner, address _spender, uint _amount) returns(bool success) {
        if ( _owner == vaultAddress ) {
            return true;
        }
        return false;
    }

    /// @dev `doPayment()` is an internal function that sends the ether that this
    ///  contract receives to the `vault` and creates tokens in the address of the
    ///  `_owner` assuming the PreTokenSale is still accepting funds
    /// @param _owner The address that will hold the newly created tokens
    function doPayment(address _owner) internal returns(bool success) {
        require(msg.value >= 0.01 ether && msg.value <= 0.1 ether);
        require(endFundingTime > now);

        // Track how much the PreTokenSale has collected
        require(totalCollected < maximumFunding);
        totalCollected = totalCollected.add(msg.value);

        //Send the ether to the vault
        require(vaultAddress.send(msg.value));
        
        uint256 tnbValue = tokensPerEther.mul(msg.value);
        // Creates an equal amount of tokens as ether sent. The new tokens are created in the `_owner` address
        require(tokenContract.generateTokens(_owner, tnbValue));
        Payment(_owner, msg.value, tnbValue);
        return true;
    }

    function changeTokenController(address _newController) onlyController {
        tokenContract.changeController(_newController);
    }

    /**
     * 修改TNB兑换比率
     */
    function changeTokensPerEther(uint256 _newRate) onlyController {
        require(allowChange);
        tokensPerEther = _newRate;
    }

    /**
     * 允许普通用户转账
     */
    function allowTransfersEnabled(bool _allow) onlyController {
        transfersEnabled = _allow;
    }

    /// @dev Internal function to determine if an address is a contract
    /// @param _addr The address being queried
    /// @return True if `_addr` is a contract
    function isContract(address _addr) constant internal returns (bool) {
        if (_addr == 0) {
            return false;
        }
        uint256 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }

    /// @notice `finalizeSale()` ends the PreTokenSale. It will generate the platform and team tokens
    ///  and set the controller to the referral fee contract.
    /// @dev `finalizeSale()` can only be called after the end of the funding period or if the maximum amount is raised.
    function finalizeSale() onlyController {
        require(now > endFundingTime || totalCollected >= maximumFunding);
        require(!finalized);

        //20000 TNB/ETH and 90 percent discount
        uint256 totalTokens = totalCollected * tokensPerEther * 10**18;
        if (!tokenContract.generateTokens(vaultAddress, totalTokens)) {
            revert();
        }

        finalized = true;
        allowChange = false;
    }

//////////
// Safety Methods
//////////

    /// @notice This method can be used by the controller to extract mistakenly
    ///  sent tokens to this contract.
    /// @param _token The address of the token contract that you want to recover
    ///  set to 0 in case you want to extract ether.
    function claimTokens(address _token) onlyController {
        if (_token == 0x0) {
            controller.transfer(this.balance);
            return;
        }

        ERC20Token token = ERC20Token(_token);
        uint balance = token.balanceOf(this);
        token.transfer(controller, balance);
        ClaimedTokens(_token, controller, balance);
    }

    event ClaimedTokens(address indexed _token, address indexed _controller, uint _amount);

  /// @notice Pauses the contribution if there is any issue
    function pauseContribution() onlyController {
        paused = true;
    }

    /// @notice Resumes the contribution
    function resumeContribution() onlyController {
        paused = false;
    }

    modifier notPaused() {
        require(!paused);
        _;
    }
}

