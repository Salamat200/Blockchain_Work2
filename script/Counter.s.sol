// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {Counter} from "../chain-end/Counter.sol";

contract CounterScript is Script {
    function run() external {
        vm.startBroadcast();
        new Counter(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        vm.stopBroadcast();
    }
}

