const { expect } = require("chai");
const { ethers } = require("hardhat");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("KwikTrustMarketplace", function () {

  let NFT;
  let nft;
  let Marketplace;
  let marketplace
  let deployer;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactories and Signers here.
    [deployer, addr1, addr2, ...addrs] = await ethers.getSigners();
    NFT = await ethers.getContractFactory("KwikTrustNFT");
    Marketplace = await ethers.getContractFactory("KwikTrustMarketplace");

    babluToken = await ethers.getContractFactory("BabluToken");
    babluTokenContract = babluToken.deploy()

    // To deploy our contracts
    nft = await NFT.deploy("KwikTrust", "KTX", deployer.address, deployer.address);
    marketplace = await Marketplace.deploy();

    nft.mint("test", marketplace.address)
    nft.mint("test1", marketplace.address)

    it("Should track name and symbol of the nft collection", async function () {
      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      const nftName = "KwikTrust"
      const nftSymbol = "KTX"
      expect(await nft.name()).to.equal(nftName);
      expect(await nft.symbol()).to.equal(nftSymbol);
    });

    it("Should track name and symbol of the nft collection", async function () {
      await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price)))
        .to.emit(marketplace, "Offered")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address
        )
      // Owner of NFT should now be the marketplace
      expect(await nft.ownerOf(1)).to.equal(marketplace.address);
      // Item count should now equal 1
      expect(await marketplace.itemCount()).to.equal(1)
      // Get item from items mapping then check fields to ensure they are correct
      const item = await marketplace.items(1)
      expect(item.itemId).to.equal(1)
      expect(item.nft).to.equal(nft.address)
      expect(item.tokenId).to.equal(1)
      expect(item.price).to.equal(toWei(price))
      expect(item.sold).to.equal(false)
    })


    it("Should fail if price is set to zero", async function () {
      await expect(
        marketplace.connect(addr1).makeItem(nft.address, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
      const sellerInitalEthBal = await addr1.getBalance()
      const price = ethers.utils.formatEther('1', ethers)
      // fetch items total price (market fees + item price)
      // addr 2 purchases item.
      await expect(marketplace.connect(addr2).purchaseItem(1, NFT.address, price))
        .to.emit(marketplace, "Bought")
        .withArgs(
          1,
          nft.address,
          1,
          toWei(price),
          addr1.address,
          addr2.address
        )
      // Item should be marked as sold
      expect((await marketplace.items(1)).sold).to.equal(true)
      // The buyer should now own the nft
      expect(await nft.ownerOf(1)).to.equal(addr2.address);
    })
    it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
      // fails for invalid item ids
      await expect(
        marketplace.connect(addr2).purchaseItem(2, nft.price, price)
      ).to.be.revertedWith("item doesn't exist");
      await expect(
        marketplace.connect(addr2).purchaseItem(0, nft.price, price)
      ).to.be.revertedWith("item doesn't exist");
      // Fails when not enough ether is paid with the transaction. 
      // In this instance, fails when buyer only sends enough ether to cover the price of the nft
      // not the additional market fee.
      let newPrice = new ethers.utils.formatEther("0.5", ethers)
      await expect(
        marketplace.connect(addr2).purchaseItem(1, nft.price, newPrice)
      ).to.be.revertedWith("not enough ether to cover item price and market fee");
      // addr2 purchases item 1
      await marketplace.connect(addr2).purchaseItem(1, nft.price, newPrice)
      // addr3 tries purchasing item 1 after its been sold 
      const addr3 = addrs[0]
      await expect(
        marketplace.connect(addr3).purchaseItem(1, nft.price, newPrice)
      ).to.be.revertedWith("item already sold");
    });

    it("Successful Transfer", async function () {
      expect(await marketplace.transfer(addr1.address, 1, nft.address))
    })
    it("Unsuccessful Transfer", async function () {
      expect(await marketplace.connect(addr2).transfer(addr1.address, 1, nft.address).to.be.reverted())
    })
    it("Set to Acution ", async function () {
      const date = new Date() + 1000
      date = date.value()
      expect(await marketplace.addItemToBid(1, nft.address, 200, date, babluToken.address))
    })
    it("Auction - Price must be greater than 0", async function () {
      const date = new Date() + 1000
      date = date.value()
      expect(await marketplace.addItemToBid(1, nft.address, 0, ddateata, babluToken.address).to.be.revertedWith('0x07'))
    })
    it("Auction - Time must be greater than current time", async function () {
      const date = new Date()
      date = date.value()
      expect(await marketplace.addItemToBid(1, nft.address, 200, date, babluToken.address).to.be.revertedWith('0x08'))
    })
    it("Auction - Place a bid", async function () {
      expect(await babluToken.approve(marketplace.address, 200));
      expect(await marketplace.placeBid(1, nft.address, 200))
    })
    it("Auction - Place a bid (Time is expired)", async function () {
      const date = new Date() + 1
      date = date.value()
      expect(await marketplace.addItemToBid(2, nft.address, 200, date, babluToken.address))
      expect(await babluToken.approve(marketplace.address, 200))
      expect(await marketplace.placeBid(2, nft.address, 200).to.be.revertedWith('0x09'))
    })
    it("Auction - Place a bid (Amount must be greater than previous amount)", async function () {
      expect(await babluToken.approve(marketplace.address, 200))
      expect(await marketplace.placeBid(1, nft.address, 100).to.be.revertedWith('0x10'))
    })
    it("Auction - Claim NFT", async function () {
      expect(await babluToken.approve(marketplace.address, 200))
      expect(await marketplace.claimToken(1, nft.address, 100))
    })
    it("Auction - Claim NFT (Wrong Owner)", async function () {
      expect(await babluToken.approve(marketplace.address, 200))
      expect(await marketplace.connect(addr1).claimToken(1, nft.address, 100).to.be.revertedWith('0x12'))
    })

  });
})
