import { useState } from 'react'
import { ethers, providers } from 'ethers'
import ErrorMessage from '../ErrorMessage'
import VerifyMessage from '../VerifyTransaction'
import NFTAddress from '../../contractsData/KwikTrustNFT-address.json'
// require('dotenv').config()

export default function SignMessage() {
  const [image, setImage] = useState('')
  const [signatures, setSignatures] = useState([])
  const [error, setError] = useState()
  const [formData, setFormData] = useState({})
  const { nftName, description, category, uri } = formData
  const privateKey =
    '11aa78f2b32af7dc6c5933157e1144eca14306f9d18a7371eb4c24fef14d57d6'
  let signerAddress = '0xDcbA8cae79605FA6C5aC3A4F2d4c652aF42073Fe'
  let contractAddress = '0xF5E82c9085f153Aea21dd215e54D8B375008a5B4'

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSign = async (e) => {
    e.preventDefault()

    const signingDomain = async () => {
      const domain = {
        name: 'LazyMint-Voucher',
        version: '1',
        verifyingContract: contractAddress,
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

    setError()

    // const signer = new ethers.Wallet(privateKey, providers.getDefaultProvider())
    await window.ethereum.send('eth_requestAccounts')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const signature = await signer._signTypedData(domain, types, voucher)
    console.log(voucher)

    const sig = {
      nftName,
      description,
      category,
      uri,
      signature,
      signerAddress,
    }

    if (signature) {
      setSignatures([...signatures, sig])
    }
  }

  return (
    <>
      <form className='m-4' onSubmit={handleSign}>
        <div className='credit-card w-full mx-auto rounded-xl bg-white'>
          <main className='mt-4 p-4'>
            <h1 className='text-xl font-semibold text-gray-700 text-center'>
              Lazy mint NFT
            </h1>
            <div className='my-3'>
              <input
                required
                type='text'
                name='uri'
                className='textarea w-full h-24 textarea-bordered focus:ring focus:outline-none'
                placeholder='Token URI'
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div>
            <div className='my-3'>
              <input
                required
                type='text'
                name='priceNft'
                className='textarea w-full h-24 textarea-bordered focus:ring focus:outline-none'
                placeholder='Price'
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div>
            <div className='my-3'>
              <input
                required
                type='text'
                name='token'
                className='textarea w-full h-24 textarea-bordered focus:ring focus:outline-none'
                placeholder='ERC20 Token Address'
                onChange={(e) => {
                  onChange(e)
                }}
              />
            </div>
          </main>
          <footer className='p-4'>
            <button
              type='submit'
              className='btn btn-primary submit-button focus:ring focus:outline-none w-full'
            >
              Mint NFT
            </button>
            <ErrorMessage message={error} />
          </footer>
        </div>
      </form>
      {signatures.map((sig, idx) => {
        return (
          <div className='row'>
            <div className='col-lg-4'>
              <VerifyMessage
                tokenuri={sig.uri}
                pricenft={sig.price}
                signat={sig.signature}
                signerAddress={sig.signerAddress}
                token={sig.token}
              />
            </div>
          </div>
        )
      })}
    </>
  )
}
