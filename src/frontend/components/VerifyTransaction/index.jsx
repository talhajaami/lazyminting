import { useState } from 'react'
import { ethers } from 'ethers'
import NFTAbi from '../../contractsData/KwikTrustNFT.json'
import NFTAddress from '../../contractsData/KwikTrustNFT-address.json'
import { Row, Col, Card, Button } from 'react-bootstrap'


const VerifyMessage = ({ nftImage, nftName, desc, categ, tokenUri, signat, signerAddress }) => {
  const [walletAddress, setWalletAddress] = useState()
  const [formData, setFormData] = useState({})
  const marketplace = '0xA5c1216F60Fdb31CF94b8DE9A0d9E12097d7a4Ef'
  const addressValidator = "0xbf09ee4e0f90ee3081abe249f39a24b46298efcf"
  let contractAddress = '0xF5E82c9085f153Aea21dd215e54D8B375008a5B4'

  const connectWallet = async () => {
    // Check if MetaMask is installed on user's browser
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      // Check if user is connected to Mainnet
      if (true) {
        let wallet = accounts[0]
        setWalletAddress(wallet)
      }
    } else {
      alert('Please install Mask')
    }
  }

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVerification = async (e) => {
    console.log(nftImage)
    e.preventDefault()
    const voucher = {
      nftName: nftName,
      description: desc,
      category: categ,
      uri: tokenUri,
      signature: signat,
      signer: signerAddress
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const address = signer.getAddress()
    const contract = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    // console.log(signerAddress, walletAddress, voucher, marketplace)

    let result = await contract
      .lazyMint(voucher)
      .catch((error) => {
        alert(error.message)
      })
    alert(result.hash)
    contract.on('checkRole', (addr) => {
      console.log(addr)
    })

    // for(let i=0; i<=10; i++){

    //   const wallet = ethers.Wallet.createRandom()
    //   console.log('address:', wallet.address)
    //   console.log('mnemonic:', wallet.mnemonic.phrase)
    //   console.log('privateKey:', wallet.privateKey)
    // }

    // let result = await contract
    //   .lazyMint(signerAddress, walletAddress, voucher, marketplace)
    // alert("https://mumbai.polygonscan.com/tx/" + result.hash)

  }

  return (
    <>
      <button className='btn btn-light text-dark' onClick={connectWallet}>
        Connect {walletAddress}
      </button>
      <Card>
        <Card.Img variant="top" src={nftImage} />
        <Card.Body color="secondary">
          <Card.Title>{nftName}</Card.Title>
          <Card.Text>
            {desc}
          </Card.Text>
          <Card.Text>
            {categ}
          </Card.Text>
          {/* <Card.Text>
            {tokenUri}
          </Card.Text> */}
        </Card.Body>
        <Card.Footer>
          <div className='d-grid'>
            <Button onClick={(e) => handleVerification(e)} variant="primary" size="lg">
              BUY
            </Button>
          </div>
        </Card.Footer>
      </Card>
      {/* <form className='m-4' onSubmit={handleVerification}>
        <div className='col-lg-4'>
          <main className='mt-4 p-4'>
            <h1 className='text-xl font-semibold text-gray-700 text-center'>
              Buy NFT
            </h1>
            <div className='my-3'>
              <input
                required
                type='text'
                name='tokenuri'
                className='textarea w-full h-24 textarea-bordered focus:ring focus:outline-none'
                value={tokenuri}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div>
            <div className='my-3'>
              <input
                required
                type='text'
                name='price'
                className='textarea w-full h-24 textarea-bordered focus:ring focus:outline-none'
                placeholder='Price'
                value={priceWEth}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div>
            <div className='my-3'>
              <input
                required
                type='text'
                name='signatures'
                className='textarea w-full h-24 textarea-bordered focus:ring focus:outline-none'
                placeholder='Signature'
                value={signat}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div> */}
      {/* <div className='my-3'>
              <input
                required
                type='text'
                name='address'
                className='textarea w-full input input-bordered focus:ring focus:outline-none'
                placeholder='Signer address'
                value={addressValidator}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div> */}
      {/* </main>
          <footer className='p-4'>
            <button
              type='submit'
              className='btn btn-primary submit-button focus:ring focus:outline-none w-full'
            >
              Buy {priceWEth} Eth
            </button>
          </footer>
        </div>
      </form> */}
    </>
  )
}

export default VerifyMessage
