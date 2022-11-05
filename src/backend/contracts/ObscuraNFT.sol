//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ObscuraNFT is ERC721URIStorage, AccessControl {
    using Strings for uint256;
    uint256 private tokenId = 0;
    uint256 private price;
    string private uri;
    bool public isRevealed = false;
    string private baseExtension = ".json";

    bytes32 public constant REVEAL_ROLE = keccak256("REVEAL_ROLE");

    event mintToken(address _minter, uint256 _tokenId);
    event revealNft(bool isReveal);
    event mintPrice(uint256 _price);
    event setTokenURI(string _tokenUri);

    constructor(address _adminRole, string memory _tokenUri) ERC721("OBSCURA NFT", "OBS") {
        _setupRole(DEFAULT_ADMIN_ROLE, _adminRole);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantRole(REVEAL_ROLE, _adminRole);
        grantRole(REVEAL_ROLE, msg.sender);
        setURI(_tokenUri);
    }

    /**
     * @dev setting nft price
     * @param _price NFT price
     */

    function setPrice(uint256 _price) public {
        price = _price;
        emit mintPrice(price);
    }

    function mintingPrice() public view returns (uint256) {
        return price;
    }

    /**
     * @dev setting base uri
     * @param _uri NFT URI
     */

    function setURI(string memory _uri) public {
        require(hasRole(REVEAL_ROLE, msg.sender), "0x001");
        uri = _uri;
        emit setTokenURI(uri);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return uri;
    }

    /**
     * @dev reveal BaseURI
     */

    function reveal(bool _revealStatus) public {
        require(hasRole(REVEAL_ROLE, msg.sender), "0x00");
        isRevealed = _revealStatus;
        emit revealNft(isRevealed);
    }

    /**
     * @dev tokenId for minting
     * @param _tokenId gets (random) tokenId to mint
     */

    function mint(uint256 _tokenId) external payable {
        require(msg.value == price, "0x0");
        require(tokenId <= 60);
        tokenId++;
        _mint(msg.sender, _tokenId);
        emit mintToken(msg.sender, _tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return tokenId;
    }

    /**
     * @dev get tokenURI before and after revealation
     */

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(_exists(_tokenId), "0x0");

        string memory currentBaseURI = _baseURI();

        if (isRevealed == false) {
            return
                string(
                    abi.encodePacked(
                        "crimson-added-cephalopod-217.mypinata.cloud/ipfs/QmNk2rc3tU7pQmJXvrtg7Fs8H75MqmCNoFc5speRmiGLSP"
                    )
                );
        }

        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        _tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

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
