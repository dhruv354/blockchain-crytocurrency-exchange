// SPDX-License-Identifier: MIT


pragma solidity >=0.5.1 ;

contract Token{
    string public name = "Dhruv";
    string public symbol = "DhruvToken";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint) public balanceOf;

    constructor() public{
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        return true;
    }
}


