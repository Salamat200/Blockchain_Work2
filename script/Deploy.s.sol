// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../chain-end/Counter.sol";

contract DeployScript is Script {
    function run() external {
        address deployer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        Counter counter = new Counter(deployer);
        
        // Log the deployed address
        console.log("Counter deployed at:", address(counter));
    }
}
