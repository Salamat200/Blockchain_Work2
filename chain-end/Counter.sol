// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Counter is Ownable {
    string[] public wordsArray = [
        "Lorem", "ipsum", "dolor", "sit", "amet", 
        "consectetur", "adipiscing", "elit", "sed", "do"
    ];
    
    uint256 public num;
    
    // Events to log payments
    event FirstElementsPaid(address indexed user, uint256 amount);
    event LastElementsPaid(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address initialOwner) Ownable(initialOwner) {
        num = 5; // Set initial value
    }
    
    // Returns first 'num' elements - costs 0.001 ETH
    function firstNumElements() external payable returns (string[] memory) {
        require(msg.value == 0.001 ether, "Please send exactly 0.001 ETH");
        require(num <= wordsArray.length, "Number exceeds array length");
        
        string[] memory result = new string[](num);
        for (uint i = 0; i < num; i++) {
            result[i] = wordsArray[i];
        }
        
        emit FirstElementsPaid(msg.sender, msg.value);
        return result;
    }
    
    // Returns elements from 'num' index to end - costs 0.002 ETH
    function lastNumElements() external payable returns (string[] memory) {
        require(msg.value == 0.002 ether, "Please send exactly 0.002 ETH");
        require(num < wordsArray.length, "Number exceeds array bounds");
        
        uint resultLength = wordsArray.length - num;
        string[] memory result = new string[](resultLength);
        
        for (uint i = 0; i < resultLength; i++) {
            result[i] = wordsArray[num + i];
        }
        
        emit LastElementsPaid(msg.sender, msg.value);
        return result;
    }
    
    // Update the number - only owner
    function updateNumber(uint256 _newNum) external onlyOwner {
        require(_newNum <= wordsArray.length, "Number exceeds array length");
        num = _newNum;
    }
    
    // Withdraw funds - only owner
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }
    
    // Helper function to get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Helper function to get entire array
    function getFullArray() external view returns (string[] memory) {
        return wordsArray;
    }
}

