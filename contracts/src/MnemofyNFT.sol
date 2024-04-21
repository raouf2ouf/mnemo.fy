// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts-v4/access/Ownable.sol";
import {MnemofyNFTFactory} from "./MnemofyNFTFactory.sol";

contract MnemofyNFT is Ownable {
    ///////////////////
    // Types
    ///////////////////

    ////////////////
    // State
    ////////////////
    MnemofyNFTFactory public immutable _factory;
    uint256 public immutable _tokenId;

    ////////////////
    // Events
    ////////////////

    ////////////////
    // Errors
    ////////////////
    error OnlyFactory();

    ////////////////
    // Construcor
    ////////////////
    constructor(
        MnemofyNFTFactory factory,
        uint256 tokenId,
        address minter
    ) Ownable() {
        _factory = factory;
        _tokenId = tokenId;
        transferOwnership(minter);
    }

    ///////////////////
    // Modifiers
    ///////////////////
    modifier onlyFactory() {
        if (msg.sender != address(_factory)) {
            revert OnlyFactory();
        }
        _;
    }

    ////////////////
    // External
    ////////////////

    ////////////////
    // Public
    ////////////////
    function transferOwnershipUsingFactory(
        address newOwner
    ) public onlyFactory {
        _transferOwnership(newOwner);
    }

    function tokenURI() public view returns (string memory) {
        return "";
    }

    ////////////////
    // Internal
    ////////////////

    ////////////////
    // Private
    ////////////////
}
