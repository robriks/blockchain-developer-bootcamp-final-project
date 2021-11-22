const HornMarketplace = artifacts.require("HornMarketplace");

module.exports = function (deployer) {
  deployer.deploy(HornMarketplace);
};
