const ethers = require('ethers')

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "KwikTrust-Voucher"
const SIGNING_DOMAIN_VERSION = "1"

class LazyMinter {

  constructor({ contract, signer }) {
    this.contract = contract
    this.signer = signer
  }

  async createVoucher(uri, price, NFTAddress, token) {
    const voucher = { uri, price, NFTAddress, token }
    const domain = await this._signingDomain()
    const types = {
      NFTVoucher: [
        { name: "uri", type: "string" },
        { name: "price", type: "uint256" },
        { name: "NFTAddress", type: "address" },
        { name: "token", type: "address" },
      ]
    }
    const signature = await this.signer._signTypedData(domain, types, voucher)
    return {
      ...voucher,
      signature,
    }
  }

  async _signingDomain() {
    if (this._domain != null) {
      return this._domain
    }
    const chainId = await this.contract.getChainID()
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    }
    return this._domain
  }
}

module.exports = {
  LazyMinter
}