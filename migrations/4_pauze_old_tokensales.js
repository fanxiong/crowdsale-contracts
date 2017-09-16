const Promise = require('bluebird');

const EarlyTokenSale = artifacts.require('EarlyTokenSale');

async function performMigration(deployer, network) {
  const oldOne = await EarlyTokenSale.at(
    '0x3f874330cbd26f5122fa9f63f8d3d44fe5c776de'
  );
  await oldOne.pauseContribution();

  const oldTwo = await EarlyTokenSale.at(
    '0xe2db27128bd2e4cf54e3a4992192f8f17ef88e02'
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
