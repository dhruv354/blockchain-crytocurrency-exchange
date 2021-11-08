const { default: Web3 } = require('web3')


const Exchange = artifacts.require('Exchange')
const Token = artifacts.require('Token')


/*******helper functions */



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

    describe('deployment', () => {

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
            it('when no tokens are approves', async() => {
                await exchange.depositToken(tokenAddress, tokens(10), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })
})