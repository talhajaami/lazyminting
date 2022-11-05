import { useState } from 'react'
import { ethers, providers } from 'ethers'
import { Row, Form, Button } from 'react-bootstrap'
import BabluToken from '../contractsData/BabluToken.json'
import BabluTokenAddress from '../contractsData/BabluToken-address.json'

const Deploy = ({ marketplace, nft, factory }) => {
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState(null)
  const [address, setAddress] = useState('')


  const createNFT = async () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    // // Set signer
    // const signer = provider.getSigner()
    const privateKey =
      "11aa78f2b32af7dc6c5933157e1144eca14306f9d18a7371eb4c24fef14d57d6"
      const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/');
    const signer = new ethers.Wallet(privateKey, provider)
    console.log(signer)
    let add = '0x73f478D6cb7632709761B217fB1a6B39DD5ee6f4'
    const babluToken = new ethers.Contract(
      add,
      BabluToken.abi,
      signer
    )

    console.log("Contract Instance: ", babluToken)
    let addr = '0xc204526A3b5EFa75E488e2D7aB34E1416a5667c8'
    const check = await babluToken.balanceOf(addr)
    console.log("Check: ", check.toString())
  }
  return (
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
                onChange={(e) => setName(e.target.value)}
                size='lg'
                required
                type='name'
                placeholder='Name'
              />
              <Form.Control
                onChange={(e) => setSymbol(e.target.value)}
                size='lg'
                required
                type='text'
                placeholder='symbol'
              />
              <Form.Control
                onChange={(e) => setAddress(e.target.value)}
                size='lg'
                required
                type='text'
                placeholder='address'
              />
              <div className='d-grid px-0'>
                <Button onClick={createNFT} variant='primary' size='lg'>
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Deploy
