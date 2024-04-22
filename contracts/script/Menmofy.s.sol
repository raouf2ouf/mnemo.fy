// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Config} from "./Config.s.sol";
import {MnemofyNFTFactory} from "../src/MnemofyNFTFactory.sol";

contract MnemofyScript is Script {
    function run() public returns (MnemofyNFTFactory) {
        Config config = new Config();
        (uint256 deployerKey, address deployerAddress) = config
            .activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        MnemofyNFTFactory factory = new MnemofyNFTFactory();
        vm.stopBroadcast();
        return factory;
    }
}
