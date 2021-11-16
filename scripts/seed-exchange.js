const Token = artifacts.require('Token');
const Exchnage = artifacts.require('Exchange');

/**helper function *****/
const tokens = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}

ether_address = '0x0000000000000000000000000000000000000000'

const wait = (seconds) => {
    const milliSeconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliSeconds))
}


module.exports = async function(callback) {



    try {
        const accounts = await web3.eth.getAccounts()
        console.log("scripts running!!!!");

        //deploy tokens
        const token = await Token.deployed()
        const exchange = await Exchnage.deployed()

        console.log(token.address, exchange.address);

        const sender = accounts[0];
        const receiver = accounts[1];
        console.log(sender, receiver);
        const amount = web3.utils.toWei('10000', 'ether')

        await token.transfer(receiver, amount, { from: sender })
        console.log(`transfers ${amount} from ${sender} to ${receiver}`);

        const user1 = accounts[0]
        const user2 = accounts[1]

        await exchange.depositEther({ from: user1, value: tokens(1) });

        //user 2 approve tokens and deposit ERC20 token
        await token.approve(exchange.address, tokens(100), { from: user2 });
        //user 2 deposits ERC20 token to their account
        await exchange.depositToken(token.address, tokens(100), { from: user2 })

        let result;
        let orderId;
        //user1 makes a order
        result = await exchange.makeOrder(token.address, tokens(50), ether_address, tokens(0.15), { from: user1 })
        orderId = result.logs[0].args.id
        console.log(`user1 => ${user1} made a order`);
        //user1 cancels the order
        await exchange.cancelOrder(orderId, { from: user1 })
        console.log(`user1 => ${user1} cancel a order`);

        //user1 makes another order
        result = await exchange.makeOrder(token.address, tokens(10), ether_address, tokens(0.1), { from: user1 })
        orderId = result.logs[0].args.id
        console.log(`user1 => ${user1} made a order`);
        ///user2 fills that order
        await exchange.fillOrder(orderId, { from: user2 })
        console.log(`user2 => ${user2} fills that order`);



        //wait 1 sec
        await wait(1)

        //user1 makes another order
        result = await exchange.makeOrder(token.address, tokens(5), ether_address, tokens(0.01), { from: user1 })
        orderId = result.logs[0].args.id
        console.log(`user1 => ${user1} made a order`);
        ///user2 fills another order
        await exchange.fillOrder(orderId, { from: user2 })
        console.log(`user2 => ${user2} fills that order`);

        //wait 1 sec
        await wait(1)

        //user1 makes another order
        result = await exchange.makeOrder(token.address, tokens(5), ether_address, tokens(0.15), { from: user1 })
        orderId = result.logs[0].args.id
        console.log(`user1 => ${user1} made a order`);
        ///user2 fills another order
        await exchange.fillOrder(orderId, { from: user2 })
        console.log(`user2 => ${user2} fills that order`);

        //seed open orders

        //user1 has 10 open orders
        for (let i = 1; i <= 10; i++) {
            result = await exchange.makeOrder(token.address, tokens(1 * i), ether_address, tokens(0.1), { from: user1 })
            await wait(1);
        }

        console.log(`user1 => ${user1} made 10 orders`);

        for (let i = 1; i <= 10; i++) {
            result = await exchange.makeOrder(ether_address, tokens(0.1), token.address, tokens(1 * i), { from: user2 })
            await wait(1);
        }

        console.log(`user1 => ${user2} made 10 orders`);



    } catch (err) {
        console.log(err);
    }


    callback()
}