// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../chain-end/Counter.sol";

contract DeployCounter {
    function run() external returns (Counter) {
        // Deploy the Counter contract and return the instance
        Counter counter = new Counter(msg.sender);
        return counter;
    }
}


