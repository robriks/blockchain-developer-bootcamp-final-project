const Helpers = artifacts.require("Helpers");

module.exports = function (deployer) {
  deployer.deploy(Helpers);
};
