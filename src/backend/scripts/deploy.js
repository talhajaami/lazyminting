async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  // Get the ContractFactories and Signers here.
  // const BabluToken = await ethers.getContractFactory('BabluToken')
  const KwikTrustNFT = await ethers.getContractFactory('KwikTrustNFT')
  // deploy contracts
  // const babluToken = await BabluToken.deploy()
  const kwikTrustNFT = await KwikTrustNFT.deploy()

  console.log('kwikTrustNFT Address: ', kwikTrustNFT.address)
  // console.log('BabluToken Address: ', babluToken.address)
  // Save copies of each contracts abi and address to the frontend.
  // saveFrontendFiles(AucMarketplace, 'AucMarketplace')
  // saveFrontendFiles(nft, 'NFT')
  saveFrontendFiles(kwikTrustNFT, 'KwikTrustNFT')
  // saveFrontendFiles(babluToken, 'BabluToken')
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

// validator public key   0xbf09ee4e0f90ee3081abe249f39a24b46298efcf

// to verify marketplace contract
// npx hardhat verify 0xF5E82c9085f153Aea21dd215e54D8B375008a5B4 KwikTrust KTX 0xDcbA8cae79605FA6C5aC3A4F2d4c652aF42073Fe 0xDcbA8cae79605FA6C5aC3A4F2d4c652aF42073Fe
// npx hardhat verify 0xfECB8887032c47F8b8e0583bfD7a4961A2C35F36 0x6f3B51bd5B67F3e5bca2fb32796215A796B79651 crimson-added-cephalopod-217.mypinata.cloud/ipfs/QmYrZxEnV8P1ycKYfAPePndQvJGCet6aq3tFdK9gRsohRo/

// to verify minting contract
// npx hardhat verify --network mumbai 0x0cE028CAC773a4867DDbd5cb3d62C2e95C8fFA7F
