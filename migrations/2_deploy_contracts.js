const Promise = require('bluebird');

const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWalletWithDailyLimit = artifacts.require('MultiSigWalletWithDailyLimit');
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');

async function performMigration(deployer, network) {
  // Deploy the MultiSigWallet that will collect the ether
  await deployer.deploy(
    MultiSigWalletWithDailyLimit,
    [
      '0xce4c68a6347e78fb853ed14e2bb2910cabfe00a7', // 1st account
      '0x423d8ed622ef2b48fa05629e1314812f66c5e80f', // 2nd account, will be removed from the wallet after testing
      '0xd62c96cd87dae2933cf2b7fafbcb757a6c84ad99', // 3rd account
      '0x5a7088e57a21d581c95930ce4b3dbb9ab097b23e', // 4th account
    ],
    2,
    web3.toWei(1000, 'ether')
  );

  // Deploy the actual DataBrokerDaoToken, the controller of the token is the one deploying. (Roderik)
  await deployer.deploy(DataBrokerDaoToken);

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

  // Set the controller of the token to the early token sale
  const DeployedDataBrokerDaoToken = await DataBrokerDaoToken.deployed();
  DeployedDataBrokerDaoToken.changeController(EarlyTokenSale.address);
  console.info("EarlyTokenSale.address 1::", EarlyTokenSale.address)
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
