
pragma solidity ^0.4.15;

import "../TNBToken.sol";


contract FailingMockToken is TNBToken {  

    bool second;

    function FailingMockToken(bool _second) TNBToken(   
      "Failing Mock Token", // Token name
      18,                     // Decimals
      "MOCK",                 // Symbol
      true                   // Enable transfers
      ) 
      {
        second = _second;
      }

    function generateTokens(address _owner, uint _amount) onlyController returns (bool) {
        require(false);
        return false;
    }

}