//SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

contract  Token {
    enum UserType{TokenHolder,Admin,Owner}
    
    struct AccountInfo {
        address account;
        string firstName;
        string lastName;
        UserType userType;
    }

    mapping(address=>uint256)public tokenBalance;
    mapping(address=>AccountInfo) public registeredAccount;
    mapping(address=>bool) public frozenAccount;
    address public owner = 0xc1dA3D045A0CDD7A0eBb1d4170149ebe22d21f29;
    uint256 public constant maxTransferLimit = 15000;

    event Transfer(address indexed from, address indexed to,uint256 value);
    event FrozenAccount(address target, bool frozen);

    modifier onlyOwner {
        require(msg.sender == owner);_;
    }

    constructor(uint256 _initalSupply) public{
        owner = msg.sender;
        
    }
}