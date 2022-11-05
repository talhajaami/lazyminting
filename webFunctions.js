// ---------- for uploading image and metadata to IPFS ----------- //

// yeh 'marketplace, nft' contract addresses hen jo props mn leny hen ya wesy e kisi var mn static likh din

const projectId = '2DTzPWLbFhEcwsNVZSEnG7WOFfA';   // <---------- your Infura Project ID
const projectSecret = 'ab50ee28a53e37298f049068d200875c';  // <---------- your Infura Secret
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
            setImage(`https://kwiktrust.infura-ipfs.io/ipfs/${result.path}`)
        } catch (error) {
            console.log('ipfs image upload error: ', error)
        }
    }
}

const createNFT = async () => {
    if (!image || !name || !description || !price || !category || !subcategory || !description) return // for erc721
    if (!image || !name || !description || !amount || !price || !category || !subcategory || !description) return // for erc1155
    // call api to post data in db
    try {
        const result = await client.add(
            JSON.stringify({ image, price, name, description })
        )
        mintThenList(result)
    } catch (error) {
        console.log('ipfs uri upload error: ', error)
    }
}

// ---------- for ERC721 NFT minting and listing on marketplace ----------- //


const mintThenList = async (result) => {
    const uri = `https://kwiktrust.infura-ipfs.io/ipfs/${result.path}`
    // mint nft
    await (
        await nft.mint(uri, marketplace.address).catch((error) => {
            alert(error.message)
        })
    ).wait()
    const tokenId = null;
    nft.on('handleMint', (id) => {
        tokenId = parseInt(id)
    })
    
    // call api to update tokenId in db that is recently added in db at line 35
    console.log('TokenId : ', tokenId)
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await (
        await marketplace
            .makeItem(nft.address, id, listingPrice)
            .catch((error) => {
                alert(error.message)
            })
    ).wait()
}

// ----------- erc1155 minting and listing ----- //

const mintThenList = async (result) => {
    const uri = `https://kwiktrust.infura-ipfs.io/ipfs/${result.path}`
    // mint nft
    await (
        await nft.mint(uri, amount).catch((error) => {
            alert(error.message)
        })
    ).wait()
    const tokenId = null;
    // get tokenId of new nft
    nft.on('handleMint', (id) => {
        tokenId = parseInt(id)
    })
    console.log('TokenId : ', tokenId)
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString())
    await (
        await marketplace
            .makeItem(id, amount, listingPrice)
            .catch((error) => {
                alert(error.message)
            })
    ).wait()
}
