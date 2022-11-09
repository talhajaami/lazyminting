require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')

require('dotenv').config()
const { API_URL, PRIVATE_KEY } = process.env
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

module.exports = {
  defaultNetwork: 'mumbai',
  networks: {
    hardhat: {},
    goerli: {
      //paste Infure RPC URL here 
      url: '',
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/KU519DOZ4Zb0Biz9AE34az9iGEdqoyzL',
      accounts: [PRIVATE_KEY],
    },
    matic: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    artifacts: './src/backend/artifacts',
    sources: './src/backend/contracts',
    cache: './src/backend/cache',
    tests: './src/backend/test',
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    // paste etherscan API key here
    apiKey: '', // for ethereum
  },
}
