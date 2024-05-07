// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >= 0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Sales is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _salesIds;
    struct SalesStruct {
        uint256 saleId;
        uint256 userId;
        string[] items;
        uint256[] prices;
    }
    mapping(uint256 => SalesStruct) public sales;

    function insertSale(uint256 userId, string[] memory items, uint256[] memory prices) public onlyOwner returns(uint256) {
        _salesIds.increment();
        uint256 newSaleId = _salesIds.current();
        SalesStruct memory newSale = SalesStruct(newSaleId,userId,items,prices);
        sales[newSaleId] = newSale;
        return newSaleId;
    }

    function getSales() public view returns(SalesStruct[] memory) {
        SalesStruct[] memory salesArray = new SalesStruct[](_salesIds.current());
        for (uint i = 0; i < _salesIds.current(); i++) {
            SalesStruct storage sale = sales[i+1];
            salesArray[i] = sale;
        }
        return salesArray;
    }

    function getSaleById(uint256 saleId) public view returns(SalesStruct memory) {
        return sales[saleId];
    }

    function getSalesByUserId(uint256 userId) public view returns (SalesStruct[] memory) {
        SalesStruct[] memory salesArray = new SalesStruct[](_salesIds.current());
        for (uint i = 0; i < _salesIds.current(); i++) {
            SalesStruct storage sale = sales[i+1];
            if(sale.userId == userId){
                salesArray[i] = sale;
            }
        }
        return salesArray;
    }
}