// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Ownable} from "@openzeppelin/contracts-v4/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts-v4/utils/Base64.sol";

contract MnemofyNFT is Ownable {
    ///////////////////
    // Types
    ///////////////////
    // struct Territory {
    //     string name;
    //     string points;
    //     string color;
    // }
    // struct System {
    //     string name;
    //     string color;
    //     string x;
    //     string y;
    // }

    ////////////////
    // State
    ////////////////
    address public immutable _factory;
    uint256 public immutable _tokenId;
    string[] private _territories;
    string[] private _systems;
    string private _name;

    ////////////////
    // Events
    ////////////////

    ////////////////
    // Errors
    ////////////////
    error OnlyFactory();
    error InvalidSnapshotID();

    ////////////////
    // Construcor
    ////////////////
    constructor(
        address factory,
        uint256 tokenId,
        address minter,
        string memory name,
        string[] memory territories,
        string[] memory systems
    ) Ownable() {
        _factory = factory;
        _tokenId = tokenId;
        _name = name;
        for (uint8 i = 0; i < territories.length; i++) {
            _territories.push(territories[i]);
        }
        for (uint8 i = 0; i < systems.length; i++) {
            _systems.push(systems[i]);
        }
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
        string memory svg = _generateSVG();
        string memory data = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        _name,
                        '", "description": "", "image":"data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );
        return data;
    }

    function _generateSVG() private view returns (string memory) {
        string[] memory territories = _territories;
        string[] memory systems = _systems;
        string
            memory svg = '<svg xmlns="http://www.w3.org/2000/svg" width="975" height="975"><g transform="translate(32.5,0)">';
        for (uint8 i = 0; i < territories.length; i++) {
            svg = string(
                abi.encodePacked(
                    svg,
                    '<polygon class="t" points="',
                    territories[i],
                    '"/>'
                )
            );
        }
        for (uint8 i = 0; i < systems.length; i++) {
            svg = string(
                abi.encodePacked(svg, '<circle class="s"', systems[i], "/>")
            );
        }
        return string(abi.encodePacked(svg, "</g></svg>"));
    }

    ////////////////
    // Internal
    ////////////////

    ////////////////
    // Private
    ////////////////
}
