// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract Marketplace is ReentrancyGuard, AccessControl {
    // Marketplace declarations
    // AccessControl
    bytes32 public constant TRANSFER_ROLE = keccak256("TRANSFER_ROLE");

    // token listed NFT in marketplace
    uint256 public itemCount;

    // struct
    struct Item {
        uint256 tokenId;
        IERC721 nft;
        IERC20 tokenAddress;
        uint256 price;
        address payable seller;
    }

    mapping(uint256 => Item) public items;

    // events
    event offeredSingle(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller
    );

    event offeredMultiple(
        uint256 itemId,
        address indexed nft,
        uint256[] tokenId,
        uint256 price,
        address indexed seller
    );

    event Bought(
        uint256 itemId,
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    event transferSingleNft(address _to, uint256 _tokenId);
    event transferMultipleNft(address _to, uint256[] _tokenId);

    // bidding declarations
    uint256 public biddingItems;
    struct AuctionItem {
        uint256 tokenId;
        address tokenAddress;
        address payable owner;
        uint256 askingPrice;
        address payable seller;
        address highestBidder;
        uint256 endTime;
    }


    mapping (uint256 => mapping (address => AuctionItem)) public itemsForSale;

    mapping (address => mapping (address => mapping(uint256 => uint256))) public biddingPrice;
    mapping (address => mapping (uint256 => bool)) public activeItems;

    event itemAdded(uint256 id, uint256 tokenId, address tokenAddress, uint256 askingPrice);
    event itemSold(uint256 id, address buyer, uint256 askingPrice);
    event highBidder(address _highestBidder, uint256 _price);



    // modifers
    modifier accessRole() {
        require(hasRole(TRANSFER_ROLE, msg.sender), "0x00");
        _;
    }

    // constructor
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev list NFT in marketplace
     * @param _nft minting contract address
     * @param _tokenId token id to be listed
     * @param _price listing price of token
     */

    function makeItem(
        IERC721 _nft,
        IERC20 _tokenAddress,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        // increment item count
        itemCount++;
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[_tokenId] = Item(_tokenId, _nft, _tokenAddress, _price, payable(msg.sender));
        // emit Offered event
        emit offeredSingle(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    /**
     * @dev list multiple NFTs in marketplace
     * @param _nft minting contract address
     * @param _tokenId array of token ids to be listed
     * @param _price listing price of token
     */

    function makeItemBulk(
        IERC721 _nft,
        IERC20 _tokenAddress,
        uint256[] memory _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        for (uint256 i = 0; i < _tokenId.length; i++) {
            // increment item count
            itemCount++;
            // transfer nft
            _nft.transferFrom(msg.sender, address(this), _tokenId[i]);
            // add new item to items mapping
            items[_tokenId[i]] = Item(
                _tokenId[i],
                _nft,
                _tokenAddress,
                _price,
                payable(msg.sender)
            );
        }
        emit offeredMultiple(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    /**
     * @dev purchase NFT from marketplace
     * @param _itemId NFT token id
     */

    function purchaseItem(uint256 _itemId) external payable nonReentrant {
        uint256 _totalPrice = items[_itemId].price;
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(
            msg.value >= _totalPrice,
            "not enough ether to cover item price and market fee"
        );
        item.seller.transfer(item.price);
        // delete item from marketplace
        delete items[_itemId];
        // transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        // decrement item count
        itemCount--;
        // emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
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

    function transferNftBunch(address _to, uint256[] memory _tokenIDs)
        public
        accessRole
    {
        require(_tokenIDs.length < 150, "0x01");
        for (uint256 i = 0; i < _tokenIDs.length; i++) {
            Item memory item = items[_tokenIDs[i]];
            item.nft.safeTransferFrom(address(this), _to, _tokenIDs[i]);
        }
        emit transferMultipleNft(_to, _tokenIDs);
    }

    /**
     * @dev transfer single NFT
     * @param _to reciever's address
     * @param _tokenID token ids to be sent
     */

    function transferNft(address _to, uint256 _tokenID) public accessRole {
        Item memory item = items[_tokenID];
        item.nft.safeTransferFrom(address(this), _to, _tokenID);
        emit transferSingleNft(_to, _tokenID);
    }

    // bidding functions

    /**
     * @dev listing an item for bidding
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     * @param _askingPrice mininum price of bidding
     * @param _time ending time of an auction
     */

    function addItemToBid(uint256 _tokenId, address _tokenAddress, uint256 _askingPrice, uint256 _time) external nonReentrant returns (uint256) {
        require(_askingPrice > 0, "Price must be greater than zero");
        itemsForSale[_tokenId][_tokenAddress] = AuctionItem(
            _tokenId,
            _tokenAddress,
            payable(msg.sender),
            _askingPrice,
            payable (address(this)),
            msg.sender,
            _time
        );
        assert(itemsForSale[_tokenId][_tokenAddress].tokenId == _tokenId);
        activeItems[_tokenAddress][_tokenId] = true;
        IERC721(_tokenAddress).transferFrom(msg.sender, address(this), _tokenId);
        biddingItems++;
        emit itemAdded(_tokenId, _tokenId, _tokenAddress, _askingPrice);
        return (_tokenId);
    }

    /**
     * @dev placing bid
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     */

    function bid(uint256 _tokenId, address _tokenAddress) public payable {
        require(biddingPrice[msg.sender][_tokenAddress][_tokenId] == 0, "Already bidded");
        require(block.timestamp < itemsForSale[_tokenId][_tokenAddress].endTime, "Auction has been ended");
        require(itemsForSale[_tokenId][_tokenAddress].askingPrice < msg.value, "Amount must be greater then previous bid");
        biddingPrice[msg.sender][_tokenAddress][_tokenId] = msg.value;
        itemsForSale[_tokenId][_tokenAddress].highestBidder = msg.sender;
        itemsForSale[_tokenId][_tokenAddress].askingPrice = msg.value;

        emit highBidder(msg.sender, msg.value);
    }

    /**
     * @dev withdraw amount for lower bidders
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     */

    function withdraw(uint256 _tokenId, address _tokenAddress) public payable {
        require(block.timestamp > itemsForSale[_tokenId][_tokenAddress].endTime, "Auction is not completed yet!");
        require(biddingPrice[msg.sender][_tokenAddress][_tokenId] > 0, "Invalid User");
        require(msg.sender != itemsForSale[_tokenId][_tokenAddress].highestBidder, "Higest Bidder! you cannot withdraw untill another highest bidder comes");
        uint256 withdrawAmount = biddingPrice[msg.sender][_tokenAddress][_tokenId];
        payable(msg.sender).transfer(withdrawAmount);
    }

    /**
     * @dev withdraw amount for lower bidders
     * @param _tokenId Token Id of NFT
     * @param _tokenAddress Contract address of NFT
     */

    function buyItem(uint256 _tokenId, address _tokenAddress) payable external nonReentrant {
        require(block.timestamp > itemsForSale[_tokenId][_tokenAddress].endTime, "Auction is not completed yet!"); 
        delete itemsForSale[_tokenId][_tokenAddress];
        activeItems[itemsForSale[_tokenId][_tokenAddress].tokenAddress][itemsForSale[_tokenId][_tokenAddress].tokenId] = false;
        IERC721(itemsForSale[_tokenId][_tokenAddress].tokenAddress).transferFrom(address(this), itemsForSale[_tokenId][_tokenAddress].highestBidder, itemsForSale[_tokenId][_tokenAddress].tokenId);
        itemsForSale[_tokenId][_tokenAddress].seller.transfer(itemsForSale[_tokenId][_tokenAddress].askingPrice);
        biddingItems--;
        emit itemSold(_tokenId, msg.sender, itemsForSale[_tokenId][_tokenAddress].askingPrice);
    }
}
