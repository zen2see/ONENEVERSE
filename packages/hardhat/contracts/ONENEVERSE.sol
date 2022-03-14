//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract ONENEVERSE is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _onvIds;
    Counters.Counter private _onvItemsSold;
    
    address payable owner;
    uint256 listingPrice = 0.025 ether;
    mapping(uint256 => ONVItem) private onvItemId;
    
    struct ONVItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event ONVItemCreated (
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    constructor() ERC721("ONV Tokens", "ONV") {
        owner = payable(msg.sender);
    }

    // Updates the listing price 
    function updateListingPrice(uint _listingPrice) public payable {
        require(owner == msg.sender, "Only ONV owner can update listing price.");
        listingPrice = _listingPrice;
    }

    // Returns the listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Mints and list an ONV token 
    function createToken(
        string memory tokenURI,
        uint256 price
    ) 
        public 
        payable 
        returns (uint) 
    {
        _onvIds.increment();
        uint256 newOnvId = _onvIds.current();
        _mint(msg.sender, newOnvId);
        _setTokenURI(newOnvId, tokenURI);
        createONVItem(newOnvId, price);
        return newOnvId;
    }
    // Creates an ONV Item
    function createONVItem(
        uint256 tokenId,
        uint256 price 
    ) 
        private 
    {
        require(price > 0, "Price must be > 0 wei");
        require(msg.value == listingPrice, "Price must be = to listing price");       
        onvItemId[tokenId] = ONVItem(
            tokenId, 
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
        _transfer(msg.sender, address(this), tokenId);
        emit ONVItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    // Token resell
    function resellToken(uint256 tokenId, uint256 price) 
        public 
        payable 
    {
        require(onvItemId[tokenId].owner == msg.sender, "Only owner of item can resell");
        require(msg.value == listingPrice, "Price must be = to listing price");
        onvItemId[tokenId].sold = false;
        onvItemId[tokenId].price = price;
        onvItemId[tokenId].seller = payable(msg.sender);
        onvItemId[tokenId].owner = payable(address(this));
        _onvItemsSold.decrement();
        _transfer(msg.sender, address(this), tokenId);
    }

    // Create sale of item and transfers ownership/funds
    function createONVSale(
        uint256 tokenId
    )
        public
        payable 
    {      
        uint price = onvItemId[tokenId].price;
        address seller = onvItemId[tokenId].seller;
        require(msg.value == price, "Please submit the asking price");
        onvItemId[tokenId].owner = payable(msg.sender);
        onvItemId[tokenId].sold = true;
        onvItemId[tokenId].seller = payable(address(0));
        _onvItemsSold.increment();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);
    }

    // Retrieves all unsold items
    function retrieveUnsoldItems() 
        public
        view
        returns (ONVItem[] memory)
    {
        uint itemCount = _onvIds.current();
        uint unsoldItemCount = _onvIds.current() - _onvItemsSold.current();
        uint currentIndex = 0;
        ONVItem[] memory items = new ONVItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (onvItemId[i + 1].owner == address(this)) {
                uint currentId = i + 1;
                ONVItem storage currentItem = onvItemId[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // Retrieves user purchased items
    function retrievePurchasedItems()
        public 
        view
        returns (ONVItem[] memory) 
    {
        uint totalItemCount = _onvIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 0; i < totalItemCount; i++) {
            if (onvItemId[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }
        ONVItem[] memory items = new ONVItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (onvItemId[i +1].owner == msg.sender) {
                uint currentId = i + 1;
                ONVItem storage currentItem = onvItemId[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;     
    }

    // Retrieves user listed items
    function retrieveItemsListed() 
        public
        view
        returns (ONVItem[] memory)
    {
        uint totalItemCount = _onvIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;
        for (uint i = 0; i < totalItemCount; i++) {
            if (onvItemId[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }
        ONVItem[] memory items = new ONVItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (onvItemId[i + 1].seller == msg.sender) {
                uint currentId = i + 1;
                ONVItem storage currentItem = onvItemId[currentId];
                items[currentIndex] = currentItem; 
                currentIndex += 1;
            }
        }
        return items;
    }    
}
