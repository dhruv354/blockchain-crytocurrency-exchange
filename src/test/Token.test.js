require('chai')
    .use(require('chai-as-promised'))
    .should()


const Token = artifacts.require('./Token')

contract('Token', (accounts) => {
    describe('deployment', () => {
        it('tracks the name', async() => {
            //read token name here
            const token = await Token.new()
            const name = await token.name()
            name.should.equal('Dhruv')
        })
    })
})