// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract KwikTrustNFT is ERC721URIStorage, EIP712, AccessControl {
   
    // Signing domains
    string private constant SIGNING_DOMAIN = "LazyMint-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    // variable declarations
    uint256 private tokenId;

    struct NFTVoucher {
        string nftName;
        string description;
        string category;
        string uri;
        bytes signature;
        address signer;
    }

    event checkRole(address _minter);
    event handleLazyMint(
        address signer,
        address minter,
        string uri,
        uint256 tokenId
    );

    // constructor
    constructor(
    ) ERC721("LazyMint", "LMNT") EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
    }
    /**
     * @dev nft minting
     * @param voucher struct: containing data of NFT
     */

    function lazyMint(
        NFTVoucher calldata voucher
    ) public returns(uint256) {
        address isValid = _verify(voucher);
        require(voucher.signer == isValid, "Failed to mint");
        tokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, voucher.uri);
        emit handleLazyMint(voucher.signer, msg.sender, voucher.uri, tokenId);
        return tokenId;
    }

    /**
     * @dev _hash, creating KECCAK hash of voucher
     * @param voucher struct: containing data of NFT
     */

    function _hash(NFTVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTVoucher(string nftName,string description,string category,string uri)"
                        ),
                        keccak256(bytes(voucher.nftName)),
                        keccak256(bytes(voucher.description)),
                        keccak256(bytes(voucher.category)),
                        keccak256(bytes(voucher.uri))
                    )
                )
            );
    }

    /**
     * @dev _verify, returns the public key
     * @param voucher struct: containing data of NFT
     */

    function _verify(NFTVoucher calldata voucher)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    function totalSupply() public view returns (uint256) {
        return tokenId;
    }

    /**
     * @dev supportsInterface
     * @param interfaceId interface id in bytes
     */

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC721)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
