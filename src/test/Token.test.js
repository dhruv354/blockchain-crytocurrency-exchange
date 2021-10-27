const Token = artifacts.require('Token')


require('chai')
    .use(require('chai-as-promised'))
    .should()




contract('Token', ([deployer, sender, receiver]) => {
    const symbol = 'DhruvToken'
    const decimals = '18'
    const totalSupply = tokens(1000000)
    const name = "Dhruv"
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
        it('tracks sending of tokens', async() => {
            let balanceOf;
            console.log("balance before tranfer of tokens");
            balanceOf = await token.balanceOf(deployer);
            console.log(balanceOf.toString());
            balanceOf = await token.balanceOf(receiver);
            console.log(balanceOf.toString());

            //do transfer
            await token.transfer(receiver, '1000000000000000000', { from: deployer });

            //after transfer
            console.log("balance after tranfer of tokens");
            balanceOf = await token.balanceOf(deployer);
            console.log(balanceOf.toString());
            balanceOf = await token.balanceOf(receiver);
            console.log(balanceOf.toString());
        })
    })
})