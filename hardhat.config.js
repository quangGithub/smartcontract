require("@nomiclabs/hardhat-waffle");
const projectId = 'fb084b45a8d84d98b83ef55922b0fae0'
const fs = require('fs')
const keyData = fs.readFileSync('./p-key.txt', {
  encoding:'utf8', flag:'r'
})

module.exports = {
  defaultNetwork: 'hardhat',
  network:{
    hardhat:{
      chaiId: 1337
    },
    
    mumbai:{
      url: `https://mainnet.infura.io/v3/${projectId}`,
      accounts: [keyData]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${projectId}`,
      accounts: [keyData]
    }
  },
  solidity: {
    version: "0.8.4",
    setting: {
      optimizer: {
        enable: true,
        runs: 200
      }
    }
  }
};
