import { useState } from 'react'
import { ethers } from 'ethers'
import { Row, Form, Button } from 'react-bootstrap'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import NFTAbi from '../contractsData/KwikTrustNFT.json'
import NFTAbiAddress from '../contractsData//KwikTrustNFT-address.json'
import VerifyMessage from '../components/VerifyTransaction'


const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [nftName, setNftName] = useState('')
  const [category, setCategory] = useState('')
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
        setImage(`https://marketplace-testing.infura-ipfs.io/ipfs/${result.path}`)
      } catch (error) {
        console.log('ipfs image upload error: ', error)
      }
    }
  }
  const createNFT = async () => {
    if (!image || !nftName || !description || !category) return
    try {
      const result = await client.add(
        JSON.stringify({ image, nftName, description, category })
      )
      handleSign(result)
    } catch (error) {
      console.log('ipfs uri upload error: ', error)
    }
  }

  const handleSign = async (result) => {

    const uri = `https://marketplace-testing.infura-ipfs.io/ipfs/${result.path}`
    const signingDomain = async () => {
      const domain = {
        name: 'LazyMint-Voucher',
        version: '1',
        verifyingContract: NFTAbiAddress.address,
        chainId: 80001,
      }
      return domain
    }

    const domain = await signingDomain()

    const types = {
      NFTVoucher: [
        { name: 'nftName', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'uri', type: 'string' },
      ],
    }

    const voucher = {
      nftName,
      description,
      category,
      uri
    }

    console.log(voucher)

    // const signer = new ethers.Wallet(privateKey, providers.getDefaultProvider())
    await window.ethereum.send('eth_requestAccounts')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const signature = await signer._signTypedData(domain, types, voucher)
    console.log(voucher)

    const sig = {
      image,
      nftName,
      description,
      category,
      uri,
      signature,
      address,
    }

    if (signature) {
      setSignatures([...signatures, sig])
    }
  }

  const mintThenList = async (result) => {
    const uri = `https://marketplace-testing.infura-ipfs.io/ipfs/${result.path}`
    // mint nft

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()
    const Addrs = '0xBBBB6Bb9c51A459E9b7FD75E18af98b15C6263DD'
    const mintAddr = new ethers.Contract(NFTAbiAddress.address, NFTAbi.abi, signer)
    console.log(Addrs, uri)
    let res = await (
      await mintAddr.mint(uri, Addrs).catch((error) => {
        alert(error.message)
      })
    ).wait()
    console.log(res)
    console.log(res.hash)
    console.log(parseInt(res.events[2].args[1]))

    // // add nft to marketplace
    // const listingPrice = ethers.utils.parseEther(price.toString())
    // await (
    //   await marketplace
    //     .makeItem(nft.address, id, listingPrice)
    //     .catch((error) => {
    //       alert(error.message)
    //     })
    // ).wait()
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
                  onChange={(e) => setNftName(e.target.value)}
                  size='lg'
                  required
                  type='text'
                  placeholder='Name'
                />
                <Form.Control
                  onChange={(e) => setDescription(e.target.value)}
                  size='lg'
                  required
                  as='textarea'
                  placeholder='Description'
                />
                <Form.Control
                  onChange={(e) => setCategory(e.target.value)}
                  size='lg'
                  required
                  type='text'
                  placeholder='Category'
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
                nftImage={sig.image}
                nftName={sig.nftName}
                desc={sig.description}
                categ={sig.category}
                tokenUri={sig.uri}
                signat={sig.signature}
                signerAddress={sig.address}
              />
            </div>
          </div>
        )
      })}
    </>
  )
}

export default Create
