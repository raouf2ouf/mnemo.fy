// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts-v4/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts-v4/token/ERC721/ERC721.sol";
import {MnemofyNFT} from "./MnemofyNFT.sol";

contract MnemofyNFTFactory is Ownable, ERC721 {
    ///////////////////
    // Types
    ///////////////////

    ////////////////
    // State
    ////////////////
    uint256 private _mintPrice = 0;
    address[] private _nftAddresses;
    mapping(address => uint256) private _nftAddressToTokenId;

    ////////////////
    // Events
    ////////////////

    ////////////////
    // Errors
    ////////////////
    error NFT_NotExist();
    error sendMore();

    ////////////////
    // Construcor
    ////////////////
    constructor() Ownable() ERC721("Mnemofy", "MNEMO") {}

    ///////////////////
    // Modifiers
    ///////////////////

    ////////////////
    // External
    ////////////////
    function mint(
        address to,
        string[] memory territories,
        string[] memory systems,
        string memory projectName
    ) public payable {
        if (msg.value < _mintPrice) {
            revert sendMore();
        }
        uint256 tokenId = _nftAddresses.length;
        // minting
        MnemofyNFT nft = new MnemofyNFT(
            address(this),
            tokenId,
            to,
            projectName,
            territories,
            systems
        );
        _nftAddresses.push(address(nft));
        _nftAddressToTokenId[address(nft)] = tokenId;
        _safeMint(to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        if (from != address(0)) {
            address nftAddress = _nftAddresses[firstTokenId];
            if (nftAddress == address(0)) {
                revert NFT_NotExist();
            }
            MnemofyNFT nft = MnemofyNFT(nftAddress);
            nft.transferOwnershipUsingFactory(to);
        }
    }

    ////////////////
    // Public
    ////////////////
    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721) returns (string memory) {
        super._requireMinted(tokenId);
        address nftAddress = _nftAddresses[tokenId];
        if (nftAddress == address(0)) {
            revert NFT_NotExist();
        }
        MnemofyNFT nft = MnemofyNFT(nftAddress);
        return nft.tokenURI();
    }

    ////////////////
    // Internal
    ////////////////

    ////////////////
    // Private
    ////////////////
}
