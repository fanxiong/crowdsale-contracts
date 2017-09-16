const Promise = require('bluebird');

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWalletWithDailyLimit = artifacts.require(
  'MultiSigWalletWithDailyLimit'
);
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');

async function performMigration(deployer, network) {
  const prevEarlyTokenSale = await EarlyTokenSale.at(
    '0xe2db27128bd2e4cf54e3a4992192f8f17ef88e02'
  );

  // Deploy the MultiSigWallet that will collect the ether
  await deployer.deploy(
    MultiSigWalletWithDailyLimit,
    [
      '0x52B8398551BB1d0BdC022355897508F658Ad42F8', // Roderik
      '0xBa3e7453323e84A352892c7219Fe8C16FceB7Dd1', // Roderik 2, will be removed from the wallet after testing
      '0x16D0af500dbEA4F7c934ee97eD8EBF190d648de1', // Matthew
      '0x8A69583573b4F6a3Fd70b938DaFB0f61F3536692', // Jonathan
    ],
    2,
    web3.toWei(1000, 'ether')
  );

  if (network === 'mainnet') {
    // Deploy the Early Token Sale, again owned by the one deploying (Roderik)
    await deployer.deploy(
      EarlyTokenSale,
      1505746800, // 09/18/2017 @ 5:00pm (CET)
      1508166000, // 10/16/2017 @ 5:00pm (CET)
      MultiSigWalletWithDailyLimit.address,
      DataBrokerDaoToken.address
    );
  } else {
    const getBlock = Promise.promisify(web3.eth.getBlock);
    const { timestamp } = await getBlock('latest');
    // Deploy the Early Token Sale, again owned by the one deploying (Roderik)
    await deployer.deploy(
      EarlyTokenSale,
      timestamp - 3600,
      timestamp + 2592000,
      MultiSigWalletWithDailyLimit.address,
      DataBrokerDaoToken.address
    );
  }

  // Change the controller of the token to the early token sale
  prevEarlyTokenSale.changeTokenController(EarlyTokenSale.address);
}

module.exports = function(deployer, network) {
  deployer
    .then(function() {
      return performMigration(deployer, network);
    })
    .catch(error => {
      console.log(error);
      process.exit(1);
    });
};
