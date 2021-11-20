require("@nomiclabs/hardhat-waffle");
const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()
const projectId = 'd2495fbd26644a758c52176337d3e8b6'

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: 'https://polygon-mumbai.infura.io/v3/${projectId}',
      accounts: [privateKey]
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/d2495fbd26644a758c52176337d3e8b6',
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};
