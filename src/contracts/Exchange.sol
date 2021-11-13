// SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0;
import './Token.sol';

contract Exchange{

    address public feeAccount;
    uint256 public feePercent;

    // we are making 0x0 address to represent ether to make 
    //it representable in out tokens mapping
    address constant ETHER = address(0);

    uint256 public orderCount = 0;


    //first address is the token address which is deposited and 
    //second is the address of the user who  deposited tokens for himself
    mapping(address => mapping(address => uint256)) public tokens;
    //mapping to map id with a particular order
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public cancelOrders;

    //Exchange events
    event Deposit(address _token, address user, uint256 amount, uint256 curBalance);
    event Withdraw(address _token, address user, uint256 amount, uint256 curBalance);

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    
    event Order(
        uint id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint timestamp
    );

    event Cancel(
        uint id,
        address user,
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint timestamp
    );

    struct _Order{
        uint id;
        address user;
        address tokenGet;
        uint amountGet;
        address tokenGive;
        uint amountGive;
        uint timestamp;
    }



    function() external{
        revert();
    }

    function depositEther() payable public{
        // require(Token(_token).transferFrom(msg.sender, address(this), _amount))
        tokens[ETHER][msg.sender] += msg.value;
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    }

    function withDrawEther(uint256 _amount) public{
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] -= _amount;
        msg.sender.transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken (address _token, uint256 _amount) public{
        require(_token != ETHER);//dont allow ether exchnage through this function
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);//emit deposit event
    }
    function withdrawToken (address _token, uint256 _amount) public{
        require(_token != ETHER);//dont allow ether exchnage through this function
        // require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] -= _amount;
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);//emit deposit event
    }

    //function to make orders
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public{
        orderCount += 1;
        uint _id = orderCount;
        orders[orderCount] = _Order(_id, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        emit Order(_id, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);

    }

    function cancelOrder(uint256 _id) public{
        _Order storage my_order = orders[_id];
        require(msg.sender == address(my_order.user)); // caller of this function should be same user 
        require(my_order.id == _id); //must be a valid order
        cancelOrders[_id] = true;
       
        emit Cancel(my_order.id, my_order.user, my_order.tokenGet, 
                    my_order.amountGet, my_order.tokenGive, my_order.amountGive, now);
    }

}
