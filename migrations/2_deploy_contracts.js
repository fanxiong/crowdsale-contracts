const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');

async function performMigration(deployer) {
  // Deploy the MiniMeTokenFactory, this is the factory contract that can create clones of the token
  await deployer.deploy(MiniMeTokenFactory);

  // Deploy the MultiSigWallet that will collect the ether
  await deployer.deploy(
    MultiSigWallet,
    [
      '0xBa3e7453323e84A352892c7219Fe8C16FceB7Dd1', // Roderik
      '0xe4Dc3D3586dA28b76A23e675b8E6B4c56a5b9FF1', // Matthew
      '0x52b8398551bb1d0bdc022355897508f658ad42f0', // Jonathan
    ],
    2
  );

  // Deploy the actual DataBrokerDaoToken, the controller of the token is the one deploying. (Roderik)
  await deployer.deploy(DataBrokerDaoToken, MiniMeTokenFactory.address);

  // Deploy the Early Token Sale, again owned by the one deploying (Roderik)
  await deployer.deploy(
    EarlyTokenSale,
    1505750400, // 09/18/2017 @ 4:00pm (UTC) = 5:00pm (CET)
    1508169600, // 10/16/2017 @ 4:00pm (UTC) = 5:00pm (CET)
    MultiSigWallet.address,
    DataBrokerDaoToken.address
  );

  // Set the controller of the token to the early token sale
  const DeployedDataBrokerDaoToken = await DataBrokerDaoToken.deployed();
  DeployedDataBrokerDaoToken.changeController(EarlyTokenSale.address);
}

module.exports = function(deployer) {
  deployer
    .then(function() {
      return performMigration(deployer);
    })
    .catch(error => {
      console.log(error);
      process.exit(1);
    });
};
