const TestPayable = artifacts.require('TestPayable');

module.exports = function(deployer) {
  deployer.deploy(TestPayable);
};
