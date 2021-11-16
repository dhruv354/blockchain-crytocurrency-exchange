const { default: Web3 } = require("web3");

const Token = artifacts.require("Token");
const Exchange = artifacts.require("Exchange");

module.exports = async function(deployer) {

    //get all accounts in the blockchain 
    //for development we mean to say ganache
    const accounts = await web3.eth.getAccounts()
        //deploy token smart contract to the blockchain
    await deployer.deploy(Token);
    //deploy exchange smartcontract to the blockchain
    const feeAccount = accounts[0];
    const feePercent = 10;
    await deployer.deploy(Exchange, feeAccount, feePercent);
};