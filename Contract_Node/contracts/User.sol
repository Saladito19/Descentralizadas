// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >= 0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Users is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _userIds;
    struct User {
        string firstName;
        string lastName;
        uint256 amountSpent;
        uint256 userId;
    }
    mapping(uint256 => User) public users;

    function insertUser(string memory firstName, string memory lastName) public onlyOwner returns (uint256){
        _userIds.increment();
        uint256 newUserId = _userIds.current();
        User memory newUser = User(firstName,lastName,0,newUserId);
        users[newUserId] = newUser;
        return newUserId;
    }

    function getUsers() public view returns(User [] memory) {
        User[] memory usersArray = new User[](_userIds.current());
        for(uint i = 0 ; i < _userIds.current();i++){
            User storage user = users[i+1];
            usersArray[i]=user;
        }
        return usersArray;
    }

    function getUsersById(uint256 userId) public view returns(User memory){
        return users[userId];
    }

    function registerSale(uint256 userId, uint256 amount) public onlyOwner {
        users[userId].amountSpent += amount;
    }
}