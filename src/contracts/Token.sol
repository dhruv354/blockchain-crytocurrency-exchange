// SPDX-License-Identifier: MIT


pragma solidity >=0.5.1 ;

contract Token{
    string public name = "Dhruv";
    string public symbol = "DhruvToken";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor() public{
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    //events
    event Transfer(address from, address to, uint256 value);
    event Approve(address indexed from, address indexed to, uint256 indexed value);

    function transfer(address _to, uint256 _value) public returns (bool success){
        require(_to != address(0));
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    //internal function can be accessed only within the smart contract
    function _transfer()

    // approve the tokens
    function approve(address _spender, uint256 _value) public returns (bool success){
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approve(msg.sender, _spender, _value);
        return true;

    }

    function transferFrom(address _from, address _to, unint256 _value)  public returns (bool success){
        return true;
    }
}


