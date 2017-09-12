# DataBrokerDAO crowdsale contracts [![Build Status](https://travis-ci.org/DataBrokerDAO/crowdsale-contracts.svg?branch=master)](https://travis-ci.org/DataBrokerDAO/crowdsale-contracts)

## 1. The DATA token is an EIP/ERC20 compliant MiniMe token
The DATA token is an EIP/ERC20 MiniMe Token, based on the work of the Giveth team. It is ERC20 compliant and adds two useful features.

First, it allows for the creation of spin off tokens in the future that can have custom logic and allows for future upgrades of the token itself. For example, the creation of reputation tokens to be awarded based on DATA token holdings.

The second feature is that it keeps a full record of balances at each block. The MiniMe token is not new, and it has proven its value in projects like Aragon, Giveth, Swarm City, Status IM and Mothership. Using a token that has been audited and tested in all these projects makes for a secure and proven base for the DATA token.

## 2. The DATA token is controlled by the Early Token Sale contract
The controller of the token is the party that can create new tokens. The DATA token supply is not pre-mined. The contract only generates the tokens that are sold during the sale. During this initial phase, the Early Token Sale contract is the controller of the token. The sale will start on the 18th of September at 5 PM CET and will run for four weeks.

Coded into the sale contract is a maximum of 28.125 ETH collected at a fixed rate of 1200 DATA tokens per ETH. Again using tested techniques, the contract controls for an uneven distribution of tokens during the sale by limiting the gas price to 50 gwei and allows an address to contribute only once per 100 blocks. The gas amount needed to contribute is 300.000, the amount not used is sent back automatically by the Ethereum blockchain.

## 3. Security and compliance
We have placed safety as paramount for the token and the sale. By building on the shoulders of giants, each with their contract audits, we have eliminated a lot of potential issues. For additional security, an independent contract review of our code by Matthew Di Ferrante is currently under way. Additionally, we have ensured that the sale can be halted and restarted at any time in case of an emergency.

On the regulatory front, especially with the shifting tides globally, we are striving to become the first fully compliant sale in the world. To do this, we are partnering with IdentityMind and their new KYC/AML/CTF/PEP product designed for token sales.

All token sale contributors are reviewed by a state of the art risk-based KYC product to ensure the eligibility according to country level regulation, that they are not obfuscating their IP address, that they aren’t a known “bad actor” and that they are not on a sanctioned individuals list.

The technology being used also prevents contributors from creating more than one account, ensuring they undergo the proper KYC requirements and cannot use the token sale as a way to launder money.

Although the regulation around token sales is still being formed in most countries, several countries have already specified their requirements and these country specific requirements are met by the IdentityMind solution.

KYC=Know Your Customer, AML=Anti-Money Laundering, CTF=Counter Terrorist Financing, PEP=Politically Exposed Persons

## 4. Concluding the early token sale

After the early token sale ends, either by selling the maximum amount of tokens assigned (15%) or if the four week period has passed, a finalisation function will be called. This will mint the platform and team allocations as described in the white paper. In the period immediately after the sale concludes, the final referrals will be calculated and paid out from the platforms wallet.

## 5. Show me the code
The code for all these contract functions is available at https://github.com/DataBrokerDAO/crowdsale-contracts. The code is thoroughly tested and can be reviewed at https://travis-ci.org/DataBrokerDAO/crowdsale-contracts

## 6. Join the conversation
Learn more about DataBroker DAO at — https://databrokerdao.com 
Join Slack channel at — https://slack.databrokerdao.com/ 
Join DataBroker DAO Telegram channel at — https://t.me/databrokerdao 
Find DataBroker DAO on Facebook at — https://www.facebook.com/DataBrokerDAO/ 
Follow DataBroker DAO on Twitter at — https://twitter.com/DataBrokerDAO
