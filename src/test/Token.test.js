const { default: Web3 } = require('web3')


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

contract('Token', ([deployer, sender, receiver, exchange]) => {
    const symbol = 'DhruvToken'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    const name = "Dhruv"
    const amountTobeSent = tokens(100)
    var token
    EVM_REVERT = 'VM Exception while processing transaction: revert'

    beforeEach(async() => {
        token = await Token.new()
    })

    describe('deployment', () => {
        it('tracks the name', async() => {
            //read token name here
            const result = await token.name()
            result.should.equal(name)
        })

        it('tacks the symbol', async() => {
            const result = await token.symbol()
            result.should.equal(symbol)
        })

        it('tracks the decimals', async() => {
            const result = await token.decimals()
            result.toString().should.equal(decimals)
        })

        it('tracks the total supply', async() => {
            const result = await token.totalSupply()
            result.toString().should.equal(totalSupply)
        })

        it('assigns the total supply to the deployer', async() => {
            const result = await token.balanceOf(deployer)
            result.toString().should.equal(totalSupply)
        })
    })

    describe('sending the tokens', () => {

        let amount;
        let result;

        describe('success', async() => {
            beforeEach(async() => {
                amount = tokens(100)
            })

            it('tracks sending of tokens', async() => {
                let initial_balanceOf_deployer;
                let initial_balanceOf_receiver;
                console.log("balance before tranfer of tokens");
                initial_balanceOf_deployer = await token.balanceOf(deployer);
                console.log("initial deployer balance" + initial_balanceOf_deployer.toString());
                initial_balanceOf_receiver = await token.balanceOf(receiver);
                console.log("initial receiver balance" + initial_balanceOf_receiver.toString());

                //do transfer
                result = await token.transfer(receiver, amount, { from: deployer })

                //after transfer

                let final_balanceOf_deployer, final_balanceOf_receiver;
                console.log("balance after tranfer of tokens");

                final_balanceOf_deployer = await token.balanceOf(deployer);
                console.log("final deployer balance" + final_balanceOf_deployer.toString());

                final_balanceOf_receiver = await token.balanceOf(receiver);
                console.log("final receiver balance" + final_balanceOf_receiver.toString());

                temp1 = initial_balanceOf_deployer - amount;
                temp2 = initial_balanceOf_receiver + amount;
                temp1 = toFixed(temp1)
                temp2 = toFixed(temp2)
                temp2 = parseFloat(temp2)


                final_balanceOf_deployer.toString().should.equal(temp1.toString());
                //console.log("final deployer balance" + final_balanceOf_deployer.toString());
                final_balanceOf_receiver.toString().should.equal(temp2.toString());
            })

            it('emits a transfer event', async() => {
                const log = result.logs[0]
                log.event.should.equal('Transfer')
                console.log(log.event);
                const event = log.args
                event.from.toString().should.equal(deployer, 'who sends it is correct')
                event.to.toString().should.equal(receiver, 'reciever is correct')
                console.log("error here");
                event.value.toString().should.equal(amount.toString(), 'value sent and receivd is correct')

            })
        })

        describe('failure', async() => {
            let inValidAmount = tokens(100000000)
            it('rejects insufficient balance', async() => {
                await token.transfer(receiver, inValidAmount, { from: deployer }).should.be.rejectedWith(EVM_REVERT);
            })

            it('rejects invalid recepients', async() => {
                await token.transfer(0x0, inValidAmount, { from: deployer }).should.be.rejected;
            })
        })
    })


    describe('approving tokens', async() => {
        let result, amount;
        beforeEach(async() => {
            amount = tokens(100);
            result = await token.approve(exchange, amount, { from: deployer })
        })

        describe('success', async() => {

            it('allocates allowance for consistent token spending', async() => {
                const allowance = await token.allowance(deployer, exchange)
                    // console.log(deployer);
                    // console.log(receiver);
                    // console.log(exchange);
                    // console.log(sender);
                    // console.log("Amount: + ", amount + "allowance: " + x);
                allowance.toString().should.equal(amount.toString())
            })

            it('emits a Approval event', async() => {
                const log = result.logs[0]
                log.event.should.equal('Approve')
                console.log(log.event);
                const event = log.args
                event.from.toString().should.equal(deployer, 'who sends it is correct')
                event.to.toString().should.equal(exchange, 'reciever is correct')
                console.log("error here");
                event.value.toString().should.equal(amount.toString(), 'value sent and receivd is correct')

            })
        })

        describe('failure', () => {
            it('rejects invalid spenders', async() => {
                await token.approve(0x0, amount, { from: deployer }).should.be.rejected;
            })
        })
    })
})