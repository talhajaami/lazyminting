import { useState } from 'react'
import { ethers } from 'ethers'
import LazyMinting from '../../contractsData/LazyMinting.json'
import LazyMintingAddress from '../../contractsData/LazyMinting-address.json'
import { Card, Button } from 'react-bootstrap'


  const VerifyMessage = ({image, signerAddress, title, desc, userId, tokenUri, signat }) => {
  const [walletAddress, setWalletAddress] = useState()

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

  const handleVerification = async (e) => {
    e.preventDefault()
    const voucher = {
      signerAddress,
      title: title,
      description: desc,
      userId: userId,
      uri: tokenUri,
      signature: signat
    }
    console.log(voucher)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(LazyMintingAddress.address, LazyMinting.abi, signer)

    let result = await contract
      .lazyMint(voucher)
      .catch((error) => {
        alert(error.message)
      })
    alert(result.hash)
    contract.on('handleLazyMint', (signer, minter, uri, tokenId) => {
      console.log("Signer's Address", signer)
      console.log("Minter's Address", minter)
      console.log("Token URI", uri)
      console.log("Token Id", tokenId)
    })


  }

  return (
    <>
      <button className='btn btn-light text-dark' onClick={connectWallet}>
        Connect {walletAddress}
      </button>
      <Card>
        <Card.Img variant="top" src={image} />
        <Card.Body color="secondary">
          <Card.Title>{title}</Card.Title>
          <Card.Text>
            {desc}
          </Card.Text>
          <Card.Text>
            {userId}
          </Card.Text>
        </Card.Body>
        <Card.Footer>
          <div className='d-grid'>
            <Button onClick={(e) => handleVerification(e)} variant="primary" size="lg">
              BUY
            </Button>
          </div>
        </Card.Footer>
      </Card>
    </>
  )
}

export default VerifyMessage
