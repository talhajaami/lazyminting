const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KwikTrustFactory", function () {
    let addr1, addr2, factory, factorycontract;
    beforeEach(async function () {
        const [owner, addr1] = await ethers.getSigners();
        factory = await ethers.getContractFactory("KwikTrustFactory");
        factorycontract = factory.deploy()
    });

    it("Should Deploy Minting Contract", async function () {
        expect(await factorycontract.deployMintingContract("KwikTrust", "KTX", addr1.address, addr1.address));
    });
    it("Should not Deploy Minting Contract (Wrong Owner)", async function () {
        expect(await factorycontract.connect(addr2).deployMintingContract("KwikTrust", "KTX", addr1.address, addr1.address).to.be.reverted());
    });
});