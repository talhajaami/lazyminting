import { useState } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Button } from 'react-bootstrap'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import LazyMintingAddress from '../contractsData/LazyMinting-address.json'
import VerifyMessage from './VerifyTransaction'
// import * as dotenv from 'dotenv' 
// dotenv.config()

// const { INFURA_PROJECT_ID, INFURA_SECRET} = process.env


const Create = () => {
  const [image, setImage] = useState('')
  const [title, setTitle] = useState('')
  const [userId, setUserID] = useState('')
  const [signerAddress, setSignerAddress] = useState('')
  const [signatures, setSignatures] = useState([])
  const [description, setDescription] = useState('')

  const projectId = '2DtHpS2hFCNCsfWkYff9HFSut9f';   // <---------- your Infura Project ID
  const projectSecret = '534a9d31941cf47c27bbfb3c33b76d23';  // <---------- your Infura Secret
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth
    }
  })
  
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
        const result = await client.add(file)
        setImage(`https://<>/ipfs/${result.path}`)
      } catch (error) {
        console.log('ipfs image upload error: ', error)
      }
    }
  }
  
  const createNFT = async () => {
    if (!image || !title || !description || !userId) return
    try {
      const result = await client.add(
        JSON.stringify({ image, title, description, userId })
      )
      handleSign(result)
    } catch (error) {
      console.log('ipfs uri upload error: ', error)
    }
  }

  const handleSign = async (result) => {

    await window.ethereum.send('eth_requestAccounts')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    setSignerAddress(address)
    // paste DEDICATED GATEWAY SUBDOMAIN from Infura IPFS
    const uri = `https://<>/ipfs/${result.path}`
    const signingDomain = async () => {
      const domain = {
        name: 'LazyMint-Voucher',
        version: '1',
        verifyingContract: LazyMintingAddress.address,
        chainId: 80001, // put chain id here, on which chain you are going to deploy
      }
      return domain
    }
    const domain = await signingDomain()

    const types = {
      NFTVoucher: [
        { name: 'signerAddress', type: 'address' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'userId', type: 'string' },
        { name: 'uri', type: 'string' },
      ],
    }

    const voucher = {
      signerAddress: address,
      title,
      description,
      userId,
      uri
    }

    const signature = await signer._signTypedData(domain, types, voucher)
    console.log(voucher, signature)

    const sig = {
      image,
      signerAddress,
      title,
      description,
      userId,
      uri,
      signature

    }
    console.log(sig)

    if (signature) {
      setSignatures([...signatures, sig])
    }

  }

  return (
    <>
      <div className='container-fluid mt-5'>
        <div className='row'>
          <main
            role='main'
            className='col-lg-12 mx-auto'
            style={{ maxWidth: '1000px' }}
          >
            <div className='content mx-auto'>
              <Row className='g-4'>
                <Form.Control
                  type='file'
                  required
                  name='file'
                  onChange={uploadToIPFS}
                />
                <Form.Control
                  onChange={(e) => setTitle(e.target.value)}
                  size='lg'
                  required
                  type='text'
                  placeholder='title'
                />
                <Form.Control
                  onChange={(e) => setDescription(e.target.value)}
                  size='lg'
                  required
                  as='textarea'
                  placeholder='Description'
                />
                <Form.Control
                  onChange={(e) => setUserID(e.target.value)}
                  size='lg'
                  required
                  type='text'
                  placeholder='user id'
                />
                <div className='d-grid px-0'>
                  <Button onClick={createNFT} variant='primary' size='lg'>
                    MINT
                  </Button>
                </div>
              </Row>
            </div>
          </main>
        </div>
      </div>
      {signatures.map((sig, idx) => {
        return (
          <div className='row'>
            <div className='col-lg-4'>
              <VerifyMessage
                image={sig.image}
                signerAddress={sig.signerAddress}
                title={sig.title}
                desc={sig.description}
                userId={sig.userId}
                tokenUri={sig.uri}
                signat={sig.signature}
              />
            </div>
          </div>
        )
      })}
    </>
  )
}

export default Create
