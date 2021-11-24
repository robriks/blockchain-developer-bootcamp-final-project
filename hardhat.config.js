require("@nomiclabs/hardhat-waffle");
const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()
const infuraprojectId = fs.readFileSync(".env").toString()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  //defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
      chainId: 1337
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/' + infuraprojectId,
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
