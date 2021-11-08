// SPDX-License-Identifier: MIT


pragma solidity >=0.5.0 ;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";



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
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        return true;
    }

    //internal function can be accessed only within the smart contract
    function _transfer(address _from, address _to, uint256 _value)  internal{
        require(_to != address(0));
        balanceOf[_from] = balanceOf[_from] - (_value);
        balanceOf[_to] = balanceOf[_to] + (_value);
        emit Transfer(_from, _to, _value);
    }

    // approve the tokens
    function approve(address _spender, uint256 _value) public returns (bool success){
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approve(msg.sender, _spender, _value);
        return true;

    }

    function transferFrom(address _from, address _to, uint256 _value)  public returns (bool success){
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);
        // allowance[_from][msg.sender] =  allowance[_from][msg.sender] - _value;
        allowance[_from][msg.sender] =  allowance[_from][msg.sender] - (_value);
        _transfer(_from, _to, _value);
        return true;
    }
}


