// SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0;
import './Token.sol';

contract Exchange{

    address public feeAccount;
    uint256 public feePercent;

    // we are making 0x0 address to represent ether to make 
    //it representable in out tokens mapping
    address constant ETHER = address(0);


    //first address is the token address which is deposited and 
    //second is the address of the user who  deposited tokens for himself
    mapping(address => mapping(address => uint256)) public tokens;

    //Exchange events
    event Deposit(address _token, address user, uint256 amount, uint256 curBalance);

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }


    function() external{
        revert();
    }

    function depositEther() payable public{
        // require(Token(_token).transferFrom(msg.sender, address(this), _amount))
        tokens[ETHER][msg.sender] += msg.value;
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }
    function depositToken (address _token, uint256 _amount) public{
        require(_token != ETHER);//dont allow ether exchnage through this function
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);//emit deposit event
    }
}
