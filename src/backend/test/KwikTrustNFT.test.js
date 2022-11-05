const { expect } = require("chai");
const { ethers } = require("hardhat");
const LazyMinter = require('./lib/LazyMinting.js')

describe("KwikTrustNFT", function () {
    let nft, nftcontract;
    beforeEach(async function () {
        const [owner, addr1] = await ethers.getSigners();
        nft = await ethers.getContractFactory("KwikTrustNFT");
        nftcontract = await nft.deploy("TESET", "1", owner.address, owner.address);

        babluToken = await ethers.getContractFactory("BabluToken");
        babluTokenContract = babluToken.deploy()

        marketplace = await ethers.getContractFactory("KwikTrustMarketplace");
        marketplacecontract = await marketplace.deploy();

    });

    describe("Mint Successfull", async function () {
        it("Should mint nft ", async function () {
            expect(await nftcontract.mint("uuu", KwikTrustMarketplace.address));
        });
    });

    describe("Mint Unsuccessfull", async function () {
        it("Should  not mint nft as not the minter", async function () {
            let [owner, addr1] = await ethers.getSigners();
            nft = await ethers.getContractFactory("NFT");
            await nft.grantRole(MINTER_ROLE)
            nftcontract = await nft.deploy("TESET", "1", owner.address, owner.address);
            await expect(nftcontract.connect(addr1).mint("uuuu", KwikTrustMarketplace.address)).to.be.revertedWith(
                "0x00"
            );
        });
    });

    describe("Bulkmint Successfull", function () {
        it("Should mint bulk ", async function () {
            let array = [];
            let data = "NFT"
            for (let i = 0; i < 50; i++) {
                array.push(data);
            }
            let [owner, addr1] = await ethers.getSigners();
            nft = await ethers.getContractFactory("KwikTrustNFT");
            nftcontract = await nft.deploy("TESET", "1", owner.address, owner.address);
            await expect(nftcontract.connect(owner).mint(array, KwikTrustMarketplace.address)).to.not.be.reverted;
        });
    });

    describe("Bulkmint Not Successfull", function () {
        let arr = [];
        for (let i = 0; i < 150; i++) {
            arr.push(i);
        }
        it("Should not mint bulk (150 limit) ", async function () {
            await expect(nftcontract.connect(addr1).bulkMint(arr)).to.be.revertedWith("0x02");
        });
    });

    describe("Mint Unsuccessfull", async function () {
        let arr = [];
        for (let i = 0; i < 150; i++) {
            arr.push(i);
        }
        it("Should  not mint nft as not the minter", async function () {
            let [owner, addr1] = await ethers.getSigners();
            nft = await ethers.getContractFactory("NFT");
            nftcontract = await nft.deploy("TESET", "1", owner.address);
            await expect(nftcontract.connect(addr1).bulkMint(arr)).to.be.revertedWith(
                "0x01"
            );
        });

        // lazy minting

        it("Should redeem an NFT from a signed voucher", async function () {
            const { contract, redeemerContract, redeemer, minter } = await deploy()

            const lazyMinter = new LazyMinter({ contract, signer: minter })
            let price = ethers.utils.formatEther('1', ethers)
            const voucher = await lazyMinter.createVoucher("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", price, nftcontract.address, babluTokenContract.address)

            await babluTokenContract.approve(marketplacecontract.address, voucher.price)
            await expect(redeemerContract.mint(minter.address, redeemer.address, voucher, marketplacecontract.address))
                .to.emit(contract, 'Transfer')  // transfer from null address to minter
                .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
                .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
                .withArgs(minter.address, redeemer.address, voucher.tokenId);
        });

        it("Should fail to redeem an NFT that's already been claimed", async function () {
            const { contract, redeemerContract, redeemer, minter } = await deploy()

            const lazyMinter = new LazyMinter({ contract, signer: minter })
            let price = ethers.utils.formatEther('1', ethers)
            const voucher = await lazyMinter.createVoucher("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", price, nftcontract.address, babluTokenContract.address)

            await expect(redeemerContract.mint(redeemer.address, redeemer.address, voucher, marketplacecontract.address))
                .to.emit(contract, 'Transfer')  // transfer from null address to minter
                .withArgs('0x0000000000000000000000000000000000000000', minter.address, voucher.tokenId)
                .and.to.emit(contract, 'Transfer') // transfer from minter to redeemer
                .withArgs(minter.address, redeemer.address, voucher.tokenId);

            await expect(redeemerContract.mint(minter.address, redeemer.address, voucher))
                .to.be.revertedWith('0x03')
        });

        it("Should fail to redeem an NFT voucher that's signed by an unauthorized account", async function () {
            const { contract, redeemerContract, redeemer, minter } = await deploy()

            const signers = await ethers.getSigners()
            const rando = signers[signers.length - 1];

            const lazyMinter = new LazyMinter({ contract, signer: rando })
            let price = ethers.utils.formatEther('1', ethers)
            const voucher = await lazyMinter.createVoucher("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", price, nftcontract.address, babluTokenContract.address)

            await expect(redeemerContract.mint(minter.address, redeemer.address, voucher, marketplacecontract.address))
                .to.be.revertedWith('0x03')
        });

        it("Should fail to redeem an NFT voucher that's been modified", async function () {
            const { contract, redeemerContract, redeemer, minter } = await deploy()

            const signers = await ethers.getSigners()
            const rando = signers[signers.length - 1];

            const lazyMinter = new LazyMinter({ contract, signer: rando })
            let price = ethers.utils.formatEther('1', ethers)
            const voucher = await lazyMinter.createVoucher("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", price, nftcontract.address, babluTokenContract.address)
            voucher.tokenId = 2
            await expect(redeemerContract.mint(minter.address, redeemer.address, voucher, marketplacecontract.address))
                .to.be.revertedWith('0x03')
        });

        it("Should fail to redeem an NFT voucher with an invalid signature", async function () {
            const { contract, redeemerContract, redeemer, minter } = await deploy()

            const signers = await ethers.getSigners()
            const rando = signers[signers.length - 1];

            const lazyMinter = new LazyMinter({ contract, signer: rando })
            let price = ethers.utils.formatEther('1', ethers)
            const voucher = await lazyMinter.createVoucher("ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi", price, nftcontract.address, babluTokenContract.address)

            const dummyData = ethers.utils.randomBytes(128)
            voucher.signature = await minter.signMessage(dummyData)

            await expect(redeemerContract.mint(minter.address, redeemer.address, voucher, marketplacecontract.address))
                .to.be.revertedWith('0x03')
        });
    });

});