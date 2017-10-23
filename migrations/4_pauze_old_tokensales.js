const Promise = require('bluebird');

const EarlyTokenSale = artifacts.require('EarlyTokenSale');

async function performMigration(deployer, network) {
  const oldOne = await EarlyTokenSale.at(
    '0x8ee75377f49c71cd97fbfd6aeb9b7c36c572fd12'
  );
  await oldOne.pauseContribution();

  const oldTwo = await EarlyTokenSale.at(
    '0x0f006cd9d9fd0788e738aad04d76e6733438b1f5'
  );
  await oldTwo.pauseContribution();
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
