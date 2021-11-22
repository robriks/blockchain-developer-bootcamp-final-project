const hre = require("hardhat");

async function main() {
  const HornMarketplace = await hre.ethers.getContractFactory("HornMarketplace");
  const hornMarketplace = await HornMarketplace.deploy();
  await hornMarketplace.deployed();
  console.log("HornMarketplace deployed to:", hornMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
