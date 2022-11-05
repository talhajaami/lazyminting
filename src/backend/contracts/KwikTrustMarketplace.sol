// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract KwikTrustMarketplace is ReentrancyGuard, AccessControl {
    // AccessControl
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    // token listed NFT in marketplace
    uint256 public itemCount;

    // struct
    struct Item {
        uint256 tokenId;
        IERC20 token;
        uint256 price;
        address tokenAddress;
        address payable seller;
    }

    mapping(uint256 => mapping(address => Item)) public items;

    // events
    event offeredSingle(
        uint256 itemId,
        uint256 tokenId,
        address tokenAddress,
        uint256 price,
        address indexed seller
    );

    event offeredMultiple(
        uint256 itemId,
        uint256[] tokenId,
        address tokenAddress,
        uint256 price,
        address indexed seller
    );

    event Bought(
        uint256 itemId,
        uint256 tokenId,
        address tokenAddress,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    event transferSingleNft(
        address _to,
        uint256 _tokenId,
        address tokenAddress
    );
    event transferMultipleNft(
        address _to,
        uint256[] _tokenId,
        address tokenAddress
    );
    event deList(address _to, uint256 _tokenId, address tokenAddress);
    event deListBulk(address _to, uint256[] _tokenId, address tokenAddress);

    // bidding declarations
    uint256 public biddingItems;

    struct AuctionItem {
        uint256 tokenId;
        address tokenAddress;
        IERC20 token;
        address payable owner;
        uint256 askingPrice;
        address payable seller;
        address highestBidder;
        uint256 endTime;
    }

    mapping(uint256 => mapping(address => AuctionItem)) public itemsForAuction;
    mapping(address => mapping(uint256 => bool)) public activeItems;

    event itemAdded(
        uint256 id,
        uint256 tokenId,
        address tokenAddress,
        uint256 askingPrice
    );
    event bidClaimed(uint256 id, address buyer, uint256 askingPrice);
    event highBidder(address _highestBidder, uint256 _price);

    // constructor
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev list NFT in marketplace
     * @param _tokenId token id to be listed
     * @param _price listing price of token
     */

    function makeItem(
        IERC20 _token,
        uint256 _tokenId,
        address _tokenAddress,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "0x01");
        // increment item count
        itemCount++;
        // transfer nft
        IERC721(_tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        // add new item to items mapping
        items[_tokenId][_tokenAddress] = Item(
            _tokenId,
            _token,
            _price,
            _tokenAddress,
            payable(msg.sender)
        );
        // emit Offered event
        emit offeredSingle(
            itemCount,
            _tokenId,
            _tokenAddress,
            _price,
            msg.sender
        );
    }

    /**
     * @dev list multiple NFTs in marketplace
     * @param _token minting contract address
     * @param _tokenId minting contract address
     * @param _tokenAddress array of token ids to be listed
     * @param _price listing price of token
     */

    function makeItemBulk(
        IERC20 _token,
        uint256[] memory _tokenId,
        address _tokenAddress,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "0x02");
        for (uint256 i = 0; i < _tokenId.length; i++) {
            // increment item count
            itemCount++;
            // transfer nft
            IERC721(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _tokenId[i]
            );

            // add new item to items mapping
            items[_tokenId[i]][_tokenAddress] = Item(
                _tokenId[i],
                _token,
                _price,
                _tokenAddress,
                payable(msg.sender)
            );
        }
        emit offeredMultiple(
            itemCount,
            _tokenId,
            _tokenAddress,
            _price,
            msg.sender
        );
    }

    /**
     * @dev purchase NFT from marketplace
     * @param _itemId NFT token id
     * @param _tokenAddress NFT Contract Adress
     */

    function purchaseItem(
        uint256 _itemId,
        address _tokenAddress,
        uint256 _amount
    ) external payable nonReentrant {
        Item memory item = items[_itemId][_tokenAddress];
        uint256 _totalPrice = item.price;
        require(_itemId > 0 && _itemId <= itemCount, "0x03");
        require(_amount >= _totalPrice, "0x04");
        item.token.transferFrom(msg.sender, item.seller, _totalPrice);
        // transfer nft to buyer
        IERC721(_tokenAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );

        // decrement item count
        itemCount--;
        // delete item from marketplace
        delete items[_itemId][_tokenAddress];
        // emit Bought event
        emit Bought(
            _itemId,
            item.tokenId,
            _tokenAddress,
            item.price,
            item.seller,
            msg.sender
        );
    }

    /**
     * @dev transfer multiple NFTs
     * @param _to reciever's address
     * @param _tokenIDs token ids to be sent
     */

    function transferNftBunch(
        address _to,
        uint256[] memory _tokenIDs,
        address _tokenAddress
    ) public onlyRole(TRANSFER_ROLE) {
        for (uint256 i = 0; i < _tokenIDs.length; i++) {
            //Item memory item = items[_tokenIDs[i]][_tokenAddress];
            IERC721(_tokenAddress).safeTransferFrom(
                address(this),
                _to,
                _tokenIDs[i]
            );
        }
        emit transferMultipleNft(_to, _tokenIDs, _tokenAddress);
    }

    /**
     * @dev transfer single NFT
     * @param _to reciever's address
     * @param _tokenID token ids to be sent
     */

    function transferNft(
        address _to,
        uint256 _tokenID,
        address _tokenAddress
    ) public onlyRole(TRANSFER_ROLE) {
        Item memory item = items[_tokenID][_tokenAddress];
        IERC721(item.tokenAddress).safeTransferFrom(
            address(this),
            _to,
            _tokenID
        );
        emit transferSingleNft(_to, _tokenID, _tokenAddress);
    }

    /**
     * @dev De-list single NFT from martketplace
     * @param _tokenId NFT tokenId to be delisted
     * @param _tokenAddress NFT Minting address
     */

    function deListNft(uint256 _tokenId, address _tokenAddress)
        external
        nonReentrant
    {
        require(
            itemsForAuction[_tokenId][_tokenAddress].owner == msg.sender,
            "0x05"
        );
        IERC721(_tokenAddress).transferFrom(
            address(this),
            itemsForAuction[_tokenId][_tokenAddress].owner,
            _tokenId
        );
        emit deList(msg.sender, _tokenId, _tokenAddress);
    }

    /**
     * @dev De-list single NFT from martketplace
     * @param _tokenId NFT tokenId to be delisted
     * @param _tokenAddress NFT Minting address
     */

    function deListBulkNft(uint256[] calldata _tokenId, address _tokenAddress)
        external
        nonReentrant
    {
        for (uint256 i = 0; i < _tokenId.length; i++) {
            require(
                itemsForAuction[_tokenId[i]][_tokenAddress].owner == msg.sender,
                "0x06"
            );
            IERC721(_tokenAddress).transferFrom(
                address(this),
                itemsForAuction[_tokenId[i]][_tokenAddress].owner,
                _tokenId[i]
            );
        }
        emit deListBulk(msg.sender, _tokenId, _tokenAddress);
    }

    /**
     * @dev listing an item for bidding
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     * @param _askingPrice mininum price of bidding
     * @param _time ending time of an auction
     * @param _token ERC20 token address
     */

    function addItemToBid(
        uint256 _tokenId,
        address _tokenAddress,
        uint256 _askingPrice,
        uint256 _time,
        IERC20 _token
    ) external nonReentrant returns (uint256) {
        require(_askingPrice > 0, "0x07");
        require(block.timestamp > _time, "0x08");

        itemsForAuction[_tokenId][_tokenAddress] = AuctionItem(
            _tokenId,
            _tokenAddress,
            _token,
            payable(msg.sender),
            _askingPrice,
            payable(address(this)),
            address(0),
            _time
        );
        assert(itemsForAuction[_tokenId][_tokenAddress].tokenId == _tokenId);
        activeItems[_tokenAddress][_tokenId] = true;
        IERC721(_tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        biddingItems++;
        emit itemAdded(_tokenId, _tokenId, _tokenAddress, _askingPrice);
        return (_tokenId);
    }

    /***
     * @dev placing bid for token
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     * @param _amount  Amount enter by user
     */

    function placeBid(
        uint256 _tokenId,
        address _tokenAddress,
        uint256 _amount
    ) public payable {
        require(
            block.timestamp < itemsForAuction[_tokenId][_tokenAddress].endTime,
            "0x09"
        );
        require(
            itemsForAuction[_tokenId][_tokenAddress].askingPrice < _amount,
            "0x10"
        );

        itemsForAuction[_tokenId][_tokenAddress].token.transferFrom(
            _msgSender(),
            address(this),
            _amount
        );
        if (
            itemsForAuction[_tokenId][_tokenAddress].highestBidder != address(0)
        ) {
            itemsForAuction[_tokenId][_tokenAddress].token.transfer(
                itemsForAuction[_tokenId][_tokenAddress].highestBidder,
                itemsForAuction[_tokenId][_tokenAddress].askingPrice
            );
        }
        itemsForAuction[_tokenId][_tokenAddress].highestBidder = msg.sender;
        itemsForAuction[_tokenId][_tokenAddress].askingPrice = _amount;
        emit highBidder(msg.sender, _amount);
    }

    /**
     * @dev claim function for highest bidder to claim NFT For Nft
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     */

    function claimToken(uint256 _tokenId, address _tokenAddress)
        external
        payable
        nonReentrant
    {
        require(
            block.timestamp > itemsForAuction[_tokenId][_tokenAddress].endTime,
            "0x11"
        );
        require(
            _msgSender() ==
                itemsForAuction[_tokenId][_tokenAddress].highestBidder ||
                _msgSender() == itemsForAuction[_tokenId][_tokenAddress].owner,
            "0x12"
        );
        activeItems[itemsForAuction[_tokenId][_tokenAddress].tokenAddress][
            itemsForAuction[_tokenId][_tokenAddress].tokenId
        ] = false;
        IERC721(itemsForAuction[_tokenId][_tokenAddress].tokenAddress)
            .transferFrom(
                address(this),
                itemsForAuction[_tokenId][_tokenAddress].highestBidder,
                itemsForAuction[_tokenId][_tokenAddress].tokenId
            );
        itemsForAuction[_tokenId][_tokenAddress].token.transfer(
            itemsForAuction[_tokenId][_tokenAddress].owner,
            itemsForAuction[_tokenId][_tokenAddress].askingPrice
        );
        delete itemsForAuction[_tokenId][_tokenAddress];
        biddingItems--;
        emit bidClaimed(
            _tokenId,
            msg.sender,
            itemsForAuction[_tokenId][_tokenAddress].askingPrice
        );
    }
}
