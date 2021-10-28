const { default: Web3 } = require('web3')


const Token = artifacts.require('Token')


/*******helper functions */



const tokens = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    )
}



require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Token', ([deployer, sender, receiver]) => {
    const symbol = 'DhruvToken'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()
    const name = "Dhruv"
    const amountTobeSent = tokens(100)
    let token

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
                result = await token.transfer(receiver, amount, { from: deployer })
            })

            it('tracks sending of tokens', async() => {
                let balanceOf;
                console.log("balance before tranfer of tokens");
                balanceOf = await token.balanceOf(deployer);
                console.log(balanceOf.toString());
                balanceOf = await token.balanceOf(receiver);
                console.log(balanceOf.toString());

                //do transfer


                //after transfer


                console.log("balance after tranfer of tokens");
                balanceOf = await token.balanceOf(deployer);
                balanceOf.toString().should.equal(tokens(999800).toString());
                console.log(balanceOf.toString());
                balanceOf = await token.balanceOf(receiver);
                console.log(balanceOf.toString());
                balanceOf.toString().should.equal(tokens(100).toString())
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
    })
})