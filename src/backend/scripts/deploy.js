async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // Get the ContractFactories and Signers here.
  const LazyMinting = await ethers.getContractFactory('LazyMinting')
  // deploy contracts
  const lazyMinting = await LazyMinting.deploy()

  console.log('LazyMinting Address: ', lazyMinting.address)
  saveFrontendFiles(lazyMinting, 'LazyMinting')
}

function saveFrontendFiles(contract, name) {
  const fs = require('fs')
  const contractsDir = __dirname + '/../../frontend/contractsData'

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir)
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  )

  const contractArtifact = artifacts.readArtifactSync(name)

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

// npx hardhat run src/backend/scripts/deploy.js --network mumbai


// to verify marketplace contract
// npx hardhat verify <contract address>