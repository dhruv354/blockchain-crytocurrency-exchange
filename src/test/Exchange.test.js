const { default: Web3 } = require('web3')


const Exchange = artifacts.require('Exchange')
const Token = artifacts.require('Token')


/*******helper functions ***********/



const tokens = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}


function toFixed(x) {
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    } else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            x += (new Array(e + 1)).join('0');
        }
    }
    return x;
}

ether_address = '0x0000000000000000000000000000000000000000'


/******************helper function ends*******************/

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Exchange', ([deployer, feeAccount, user1]) => {
    let exchange
    let token
    const feePercent = 10
    EVM_REVERT = 'VM Exception while processing transaction: revert'

    beforeEach(async() => {

        //deploy token
        token = await Token.new()
            //Deploy Exchange
        exchange = await Exchange.new(feeAccount, feePercent);
        //transfer tokens from deployer to user
        await token.transfer(user1, tokens(100), { from: deployer });
    })

    describe('deployment', async() => {

        it('tracks the fee account', async() => {
            //read token name here
            const x = await exchange.feeAccount()
            x.should.equal(feeAccount)
        })

        it('tracks the fee percent', async() => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString());
        })

    })

    describe('fallback', async() => {
        it('reverts when ether is sent by mistake', async() => {
            await exchange.sendTransaction({ value: tokens(1), from: user1 }).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('depositing ETHER', () => {
        let result
        let amount = tokens(1)

        beforeEach(async() => {
            result = await exchange.depositEther({ from: user1, value: amount })
        })
        describe('success', () => {
            it('tracks ether deposit', async() => {
                balance = await exchange.tokens(ether_address, user1);
                balance.toString().should.equal(amount.toString())
            })

            it('emits a Deposit event', async() => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                console.log(log.event);
                const event = log.args;
                event._token.should.equal(ether_address, 'checks address of tokens i.e. correcttoken is sent or not')
                event.user.should.equal(user1, 'checks address of users')
                console.log("error here");
                event.amount.toString().should.equal(amount.toString(), 'tokens sent is same')
                    // userBalanceFinal = await exchange.tokens(token.address, user1);
                event.curBalance.toString().should.equal(amount.toString(), 'current balance is right')
            })
        })


        describe('failure', () => {

        })
    })

    describe('withdrawing ether', () => {
        beforeEach(async() => {
            await exchange.depositEther({ from: user1, value: tokens(1) })
        })

        describe('success', () => {
            let result
            beforeEach(async() => {
                result = await exchange.withDrawEther(tokens(1), { from: user1 })
            })

            it('withdrawing ether', async() => {
                const balance = await exchange.tokens(ether_address, user1)
                balance.toString().should.equal(balance.toString())
            })

            it('emits a WithDrawl event', async() => {
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                console.log(log.event);
                const event = log.args;
                event._token.should.equal(ether_address, 'checks address of tokens i.e. correcttoken is sent or not')
                event.user.should.equal(user1, 'checks address of users')
                console.log("error here");
                event.amount.toString().should.equal(tokens(1).toString(), 'tokens sent is same')
                    // userBalanceFinal = await exchange.tokens(token.address, user1);
                event.curBalance.toString().should.equal('0', 'current balance is right')
            })
        })
    })


    describe('depositing tokens', () => {

        let result;
        let amount = tokens(10);

        describe('success', () => {
            beforeEach(async() => {
                await token.approve(exchange.address, amount, { from: user1 })
            })
            it('tracks the token deposit', async() => {
                console.log("token address: ", token.address);
                //checks the balance of my exchange
                userBalanceInitial = await exchange.tokens(token.address, user1)
                tokenAddress = token.address
                result = await exchange.depositToken(tokenAddress, tokens(10), { from: user1 })
                const balance = await token.balanceOf(exchange.address)
                    // console.log("hello: " + balance);
                balance.toString().should.equal(amount.toString());
                userBalanceFinal = await exchange.tokens(token.address, user1);
                temp1 = parseFloat(userBalanceInitial + amount)
                temp2 = userBalanceFinal
                temp1.toString().should.equal(temp2.toString())
            })

            it('emits a Deposit event', async() => {
                const log = result.logs[0]
                log.event.should.equal('Deposit')
                console.log(log.event);
                const event = log.args;
                event._token.should.equal(tokenAddress, 'checks address of tokens i.e. correcttoken is sent or not')
                event.user.should.equal(user1, 'checks address of users')
                console.log("error here");
                event.amount.toString().should.equal(amount.toString(), 'tokens sent is same')
                    // userBalanceFinal = await exchange.tokens(token.address, user1);
                event.curBalance.toString().should.equal(amount.toString(), 'current balance is right')
            })
        })
        describe('failure', () => {

            it('it rejects ETHER deposits', async() => {
                await exchange.depositToken(ether_address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })


            it('when no tokens are approves', async() => {
                await exchange.depositToken(tokenAddress, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })


    describe('withdrawing tokens', async() => {

        let result;
        let amount = tokens(10);


        describe('success', () => {
            beforeEach(async() => {
                await token.approve(exchange.address, amount, { from: user1 })
                await exchange.depositToken(token.address, amount, { from: user1 })
                result = await exchange.withdrawToken(token.address, amount, { from: user1 })
            })
            it('tracks the token withdraw', async() => {
                console.log("token address: ", token.address);
                //checks the balance of my exchange
                balance = await exchange.tokens(token.address, user1)
                balance.toString().should.equal('0')
                    // tokenAddress = token.address

                // const balance = await token.balanceOf(exchange.address)
                //     // console.log("hello: " + balance);
                // balance.toString().should.equal(amount.toString());
                // userBalanceFinal = await exchange.tokens(token.address, user1);
                // temp1 = parseFloat(userBalanceInitial - amount)
                // temp2 = userBalanceFinal
                // temp1.toString().should.equal(temp2.toString())
            })

            it('emits a WithDrawl event', async() => {
                console.log("inside withdrawl 1");
                console.log("result " + result);
                const log = result.logs[0]
                log.event.should.equal('Withdraw')
                console.log(log.event);
                const event = log.args;
                console.log("inside withdrawl 2");
                event._token.should.equal(token.address, 'checks address of tokens i.e. correcttoken is sent or not')
                event.user.should.equal(user1, 'checks address of users')
                console.log("error here");
                event.amount.toString().should.equal(amount.toString(), 'tokens sent is same')
                    // userBalanceFinal = await exchange.tokens(token.address, user1);
                event.curBalance.toString().should.equal('0', 'current balance is right')
            })
        })
        describe('failure', () => {

            it('it rejects ETHER withdraw', async() => {
                await exchange.withdrawToken(ether_address, amount, { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects insufficient balances', async() => {
                    await exchange.withdrawToken(token.address, tokens(20), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                })
                // it('when no tokens are approves', async() => {
                //     await exchange.withdrawToken(tokenAddress, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
                // })
        })
    })

    describe('make orders', () => {
        let result;
        beforeEach(async() => {
            result = await exchange.makeOrder(token.address, tokens(1), ether_address, tokens(1), { from: user1 });
        })

        it('tracks newly created order', async() => {
            const orderCount = await exchange.orderCount()
            orderCount.toString().should.equal('1')
            const order = await exchange.orders(orderCount)
            order.id.toString().should.equal(orderCount.toString())
            order.user.should.equal(user1, 'user is same')
            order.tokenGet.should.equal(token.address)
            order.amountGet.toString().should.equal(tokens(1).toString())
            order.tokenGive.should.equal(ether_address)
            order.amountGive.toString().should.equal(tokens(1).toString())
            order.timestamp.toString().length.should.be.at.least(1, 'time is correct')
        })
    })
})