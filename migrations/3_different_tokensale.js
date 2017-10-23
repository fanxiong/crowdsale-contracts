const Promise = require('bluebird');

const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWalletWithDailyLimit = artifacts.require(
  'MultiSigWalletWithDailyLimit'
);
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');

async function performMigration(deployer, network) {
  const prevEarlyTokenSale = await EarlyTokenSale.at(
    '0x8ee75377f49c71cd97fbfd6aeb9b7c36c572fd12'
  );

  // Deploy the MultiSigWallet that will collect the ether
  await deployer.deploy(
    MultiSigWalletWithDailyLimit,
    [
      '0xce4c68a6347e78fb853ed14e2bb2910cabfe00a7', // Roderik
      '0x423d8ed622ef2b48fa05629e1314812f66c5e80f', // Roderik 2, will be removed from the wallet after testing
      '0xd62c96cd87dae2933cf2b7fafbcb757a6c84ad99', // Matthew
      '0x5a7088e57a21d581c95930ce4b3dbb9ab097b23e', // Jonathan
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
  console.info("EarlyTokenSale.address 2::", EarlyTokenSale.address)
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
