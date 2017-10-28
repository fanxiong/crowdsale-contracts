const Promise = require('bluebird');

const EarlyTokenSale = artifacts.require('EarlyTokenSale');

async function performMigration(deployer, network) {
  const oldOne = await EarlyTokenSale.at(
    '0x95aac955ef82742daff7e0e0cea0925297885c0b'
  );
  await oldOne.pauseContribution();

  const oldTwo = await EarlyTokenSale.at(
    '0xaf0358651818f895db69098aa61d34be31030aad'
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
