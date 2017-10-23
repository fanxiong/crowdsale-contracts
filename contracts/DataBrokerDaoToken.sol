pragma solidity ^0.4.15;

import "./TNBToken.sol";


contract DataBrokerDaoToken is TNBToken {  

    function DataBrokerDaoToken() TNBToken(   
      "Time New Bank", // Token name
      18,                     // Decimals
      "TNB",                 // Symbol
      true                   // Enable transfers
      ) 
      {}

}