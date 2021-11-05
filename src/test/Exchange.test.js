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

contract('Exchange', ([deployer, feeAccount]) => {
    let exchange
    let token
    const feePercent = 10
    EVM_REVERT = 'VM Exception while processing transaction: revert'

    beforeEach(async() => {
        exchange = await Exchange.new(feeAccount, feePercent);
        token = await Token.new()
    })

    describe('deployment', () => {
        beforeEach(async() => {
            await token.approve(exchange.address, tokens(10), { from })
        })
        it('tracks the fee account', async() => {
            //read token name here
            const result = await exchange.feeAccount()
            result.should.equal(feeAccount)
        })

        it('tracks the fee percent', async() => {
            const result = await exchange.feePercent();
            result.toString().should.equal(feePercent.toString());
        })

    })

    describe('depositing tokens', () => {
        describe('success', () => {
            it('tracks the token deposit', async() => {

            })
        })
        describe('failure', () => {

        })
    })
})