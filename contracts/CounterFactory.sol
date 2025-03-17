// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Counter.sol";

contract CounterFactory {
    event CounterCreated(address counterAddress, bytes32 salt, uint256 initialNumber);
    
    // Maps salt to deployed counter address
    mapping(bytes32 => address) public counters;
    
    // Create a new Counter with the provided salt and initial number
    function createCounter(bytes32 salt, uint256 initialNumber) external returns (address) {
        Counter counter = new Counter{salt: salt}(initialNumber);
        address counterAddress = address(counter);
        
        counters[salt] = counterAddress;
        emit CounterCreated(counterAddress, salt, initialNumber);
        
        return counterAddress;
    }
    
    // Get the address of a counter for a given salt
    function getCounterAddress(bytes32 salt) public view returns (address) {
        return counters[salt];
    }
}   