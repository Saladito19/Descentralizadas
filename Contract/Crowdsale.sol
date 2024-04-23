//SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;
import "SimpleCoin.sol";

contract SimpleCrowdSale{
    uint256 public startTime;
    uint256 public endTime;
    uint256 public weiTokenPrice;
    uint256 public weiInvestmentObjective;
    mapping(address=>uint256)public investmentAmountOf;
    uint256 public investmentReceived;
    uint256 public investRefunded;
    bool public isFinalized;
    bool public isRefundingAllowed;
    address public owner;
    SimpleCoin public crowdSaleToken;

    modifier onlyOwner{
        if(msg.sender != owner) revert();_;
    }

    constructor(uint256 _stratTime,uint256 _endTime,uint256 _weiTokenPrice,uint256 _etherInvestmentObjective) public{
        require(_stratTime>=block.timestamp);
        require(_endTime>=_stratTime);
        require(_weiTokenPrice != 0);
        require(_etherInvestmentObjective != 0);
        startTime=_stratTime;
        endTime = _endTime;
        weiTokenPrice = _weiTokenPrice;
        weiInvestmentObjective = _etherInvestmentObjective * 1000000000000000000;
        crowdSaleToken = new SimpleCoin(0);
        isFinalized = false;
        isRefundingAllowed = false;
        owner = msg.sender;
    }

    function isValidInvestment(uint256 _investment) internal view returns(bool){
        bool nonZeroInvestment = _investment !=0;
        bool withinCrowdsalePeriod = block.timestamp>= startTime && block.timestamp<=endTime;
        return nonZeroInvestment && withinCrowdsalePeriod;
    }

    function CalculateNumberOfToken(uint256 _investment) internal returns(uint256) {
        return _investment/weiTokenPrice;
    }

    function assignTokens(address _beneficiary, uint256 _investment) internal {
        uint256 _numberOfTokens = CalculateNumberOfToken(_investment);
        crowdSaleToken.mint(_beneficiary, _numberOfTokens);
    }

    event LogInvestment(address indexed investor, uint256 value);
    event LogtokenAssigment(address indexed investor, uint256 numTokens);

    function invest(address _beneficiary) public payable {
        require(isValidInvestment(msg.value));
        address investor = msg.sender;
        uint256 investment = msg.value;
        investmentAmountOf[investor]+=investment;
        investmentReceived+=investment;
        assignTokens(investor,investment);
        emit LogInvestment(investor, investment);
    }

    function finalize() public onlyOwner{
        if(isFinalized) revert();
        bool isCrowdSaleComplete = block.timestamp > endTime;
        bool investmentObjective = investmentReceived >= weiInvestmentObjective;
        if(isCrowdSaleComplete){
            if(investmentObjective){
                crowdSaleToken.release();
            }else{
                isRefundingAllowed = true;
            }
            isFinalized = true;
        }
    }
    event Refund(address investor, uint256 value);
    function refund() public {
        if(!isRefundingAllowed) revert();
        address payable investor = payable(msg.sender);
        uint256 investment = investmentAmountOf[investor];
        if(investment == 0) revert();
        investmentAmountOf[investor]=0;
        investRefunded += investment;
        emit Refund(msg.sender, investment);
        if(!investor.send(investment))revert();
    }
}