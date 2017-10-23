pragma solidity ^0.4.11;

contract TestPayable {
	uint256 public totalSupply = 0;
	mapping (address => uint256) public balances;

    function ()  payable {
    	uint256 value = msg.value * 100;
    	totalSupply += value;
    	balances[msg.sender] = value;
        //bool proxyPayment = TokenController(controller).proxyPayment.value(msg.value)(msg.sender);
        //require(proxyPayment);
    }

    /*
    function balanceOf(address _user) returns (uint256) {
    	return balances[_user];
    }
    */

    function withdrawalEth(address somebody, uint256 amount) public returns (bool) {
    	//require(msg.sender == creator);
    	return address(somebody).send(amount);
    	/*
    	bool result = msg.sender.send(amount);
    	eth.sendTransaction({from:msg.sender, to:somebody, value:amount});
    	return result;
    	*/
    }
}