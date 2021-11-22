const Seller = artifacts.require("Seller");

module.exports = function (deployer) {
  deployer.deploy(Seller);
};
