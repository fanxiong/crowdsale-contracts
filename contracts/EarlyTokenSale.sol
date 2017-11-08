pragma solidity ^0.4.15;

import "./DataBrokerDaoToken.sol";
import "./SafeMath.sol";
import "./interfaces/Controlled.sol";


contract EarlyTokenSale is TokenController, Controlled {

    using SafeMath for uint256;

    // In UNIX time format - http://www.unixtimestamp.com/
    uint256 public startFundingTime;
    uint256 public endFundingTime;
    
    // 37% of tokens hard cap, at 20000 TNB per ETH
    // 6,000,000,000*0.37 => 2,220,000,000 / 20000 => 1,110,000 ETH
    uint256 constant public maximumFunding = 66000 ether;
    uint256 public tokensPerEther = 20000;
    uint256 constant public maxGasPrice = 50000000000;

    uint256 constant oneDay = 86400;
    
    // antispam
    uint256 constant public maxCallFrequency = 100;
    mapping (address => uint256) public lastCallBlock;
    mapping (address => bool) public whiteList;
    address[] public waitingKYCs; //users who waiting for KYC

    struct BuyLog {
        uint256 ethValue;
        uint256 tnbValue;
    }
    //values (eth&tnb) of user that waiting for KYC
    mapping (address => BuyLog) public waitingKYC;

    // total amount raised in wei
    uint256 public totalCollected;

    // the tokencontract for the DataBrokerDAO
    TNBToken public tokenContract;

    // the funds end up in this address
    address public vaultAddress;

    bool public paused;
    bool public finalized = false;
    bool public allowChange = true;
    bool private transfersEnabled = true;

    struct DailyInfo {
        uint discount;      //discount this day
        uint256 dailyLimit; //limit this day
        uint256 dayCollected; //ETH today collected
    }
    mapping (uint => DailyInfo) public daysM;

    uint nextModTime;   //time of next modify
    uint dayPass;       //days has passed. start from 0


    /**
     * @param _startFundingTime The UNIX time that the EarlyTokenSale will be able to start receiving funds
     * @param _endFundingTime   The UNIX time that the EarlyTokenSale will stop being able to receive funds
     * @param _vaultAddress     The address that will store the donated funds
     * @param _tokenAddress     Address of the token contract this contract controls
     */
    function EarlyTokenSale(
        uint _startFundingTime, 
        uint _endFundingTime, 
        address _vaultAddress, 
        address _tokenAddress
    ) {
        require(_endFundingTime > now);
        require(_endFundingTime >= _startFundingTime);
        require(_vaultAddress != 0);
        require(_tokenAddress != 0);

        startFundingTime = _startFundingTime;
        endFundingTime = _endFundingTime;
        tokenContract = TNBToken(_tokenAddress);
        vaultAddress = _vaultAddress;
        paused = false;
    }

    function setDailyInfo(uint _dayPass, uint _discount, uint256 _limit) onlyController {
        daysM[_dayPass].discount = _discount;
        daysM[_dayPass].dailyLimit = _limit;
        daysM[_dayPass].dayCollected = 0;
    }

    function setDailyInfos(uint _dayCount, uint[] _discount, uint256[] _limit) onlyController {
        for(uint i=0; i< _dayCount; i++){
            daysM[i] = DailyInfo(_discount[i], _limit[i], 0);
        }
    }

    function getTodayInfo() internal returns (DailyInfo) {
        uint todayTime = now;
        if(todayTime > nextModTime){
            dayPass = todayTime <= startFundingTime ? 0 : (todayTime - startFundingTime)/oneDay;
            nextModTime = startFundingTime + (dayPass+1) * oneDay;
        }
        return daysM[dayPass];
    }

    function getAnydayInfo(uint _dayPass) returns (uint discount, uint256 dailyLimit, uint256 dayCollected) {
        discount = daysM[_dayPass].discount;
        dailyLimit = daysM[_dayPass].dailyLimit;
        dayCollected = daysM[_dayPass].dayCollected;
    }

    function setTime(uint time1, uint time2) onlyController {
        require(endFundingTime > now && startFundingTime < endFundingTime);
        startFundingTime = time1;
        endFundingTime = time2;
    }

    function saveWaitingKYC(address _sender, uint256 _value, uint256 _tnbValue) internal {
        waitingKYCs.push(_sender);
        waitingKYC[_sender] = BuyLog(_value, _tnbValue);
    }

    function sendTokenWhenPassKYC(address _user) onlyController {
        uint len = waitingKYCs.length;
        for(uint i = 0; i<len; i++){
            if(waitingKYCs[i] == _user){
                waitingKYCs[i] = 0;
                return;
            }
        }
        tokenContract.generateTokens(_user, waitingKYC[_user].tnbValue);
        waitingKYC[_user].ethValue = 0;
        waitingKYC[_user].tnbValue = 0;
    }

    function backEthWhenKYCFail(address _user) onlyController {
        uint len = waitingKYCs.length;
        for(uint i = 0; i<len; i++){
            if(waitingKYCs[i] == _user){
                waitingKYCs[i] = 0;
                return;
            }
        }
        //tokenContract.generateTokens(_owner, waitingKYC[_user]);
        _user.transfer(waitingKYC[_user].ethValue);
        waitingKYC[_user].ethValue = 0;
        waitingKYC[_user].tnbValue = 0;
    }

    /**
     * @dev The fallback function is called when ether is sent to the contract, it simply calls `doPayment()` with the address that sent the ether as the `_owner`. Payable is a required solidity modifier for functions to receive ether, without this modifier functions will throw if ether is sent to them
     */
    function () payable notPaused {
        doPayment(msg.sender);
    }

    /**
     * check address in the whitelist
     * @param user_address 用户地址
     */
     function beWhiteList(address user_address) returns (bool){
        return whiteList[user_address];
     }

     /**
      * add address to whitelist
      * @param user_address 用户地址
      */
    function addOneToWhiteList(address user_address) onlyController {
        whiteList[user_address] = true;
    }

     /**
      * add address to whitelist
      * @param user_address 用户地址集
      */
    function addManyToWhiteList(address[] user_address) onlyController {
        uint idx = 0;
        uint len = user_address.length;
        for(; idx < len; idx++){
            whiteList[user_address[idx]] = true;
        }
    }

    /**
     * remove address from whitelist
     * @param user_address 用户地址
     */
     function removeFromWhiteList(address user_address) onlyController {
        whiteList[user_address] = false;
     }

    /**
     * @notice `proxyPayment()` allows the caller to send ether to the EarlyTokenSale and have the tokens created in an address of their choosing
     * @param _owner The address that will hold the newly created tokens
     */
    function proxyPayment(address _owner) payable notPaused returns(bool success) {
        return doPayment(_owner);
    }

    /**
    * @notice Notifies the controller about a transfer, for this EarlyTokenSale all transfers are allowed by default and no extra notifications are needed
    * @param _from The origin of the transfer
    * @param _to The destination of the transfer
    * @param _amount The amount of the transfer
    * @return False if the controller does not authorize the transfer
    */
    function onTransfer(address _from, address _to, uint _amount) returns(bool success) {
        if ( _from == vaultAddress || transfersEnabled) {
            return true;
        }
        //just pass compile
        address x;
        uint y;
        x = _to;
        y = _amount;
        return false;
    }

    /**
     * @notice Notifies the controller about an approval, for this EarlyTokenSale all
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
        address x; 
        uint y; 
        x = _spender;
        y = _amount;
        return false;
    }

    /// @dev `doPayment()` is an internal function that sends the ether that this
    ///  contract receives to the `vault` and creates tokens in the address of the
    ///  `_owner` assuming the EarlyTokenSale is still accepting funds
    /// @param _owner The address that will hold the newly created tokens
    function doPayment(address _owner) internal returns(bool success) {
        require(tx.gasprice <= maxGasPrice);

        /*
        // Antispam
        // do not allow contracts to game the system
        require(!isContract(msg.sender));
        // limit the amount of contributions to once per 100 blocks
        require(getBlockNumber().sub(lastCallBlock[msg.sender]) >= maxCallFrequency);
        lastCallBlock[msg.sender] = getBlockNumber();
        */

        // First check that the EarlyTokenSale is allowed to receive this donation
        //TODO
        /*
        if (msg.sender != controller) {
            if(msg.value*100 > 1 ether){
                require(startFundingTime <= now);
                require(whiteList[msg.sender]);
            }
            //if user purpose is validate his address, don't limited by startTime.
        }
        */
        if (msg.sender != controller) {
            //pre sale
            if(startFundingTime <= now){
                require(msg.value >= 100 ether && msg.value <= 1000 ether);
            }
            //if user purpose is validate his address, don't limited by startTime.
        }
        require(endFundingTime > now);
        //require(tokenContract.controller() != 0);
        require(msg.value > 0);
        require(totalCollected.add(msg.value) <= maximumFunding);

        DailyInfo memory todayInfo = getTodayInfo();
        require(todayInfo.dayCollected < todayInfo.dailyLimit);

        // Track how much the EarlyTokenSale has collected
        totalCollected = totalCollected.add(msg.value);
        todayInfo.dayCollected += msg.value;

        //Send the ether to the vault
        require(vaultAddress.send(msg.value));

        uint256 tnbValue = tokensPerEther.mul(msg.value).mul(100).div(todayInfo.discount);
        // Creates an equal amount of tokens as ether sent. The new tokens are created in the `_owner` address
        if(whiteList[msg.sender]){
            require(tokenContract.generateTokens(_owner, tnbValue));
        }else{
            saveWaitingKYC(msg.sender, msg.value, tnbValue);
        }
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

    /// @notice `finalizeSale()` ends the EarlyTokenSale. It will generate the platform and team tokens
    ///  and set the controller to the referral fee contract.
    /// @dev `finalizeSale()` can only be called after the end of the funding period or if the maximum amount is raised.
    function finalizeSale() onlyController {
        require(now > endFundingTime || totalCollected >= maximumFunding);
        require(!finalized);

        uint256 reservedTokens = 225000000 * 0.35 * 10**18;      
        if (!tokenContract.generateTokens(vaultAddress, reservedTokens)) {
            revert();
        }

        finalized = true;
        allowChange = false;
    }

//////////
// Testing specific methods
//////////

    /// @notice This function is overridden by the tests.
    function getBlockNumber() internal constant returns (uint256) {
        return block.number;
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
