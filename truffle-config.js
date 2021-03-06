require('babel-register')
require('babel-polyfill')
require('dotenv').config()
// const privateKeys = process.env.PRIVATE_KEYS || ""
const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const PRIVATE_KEYS = "c3e5b94520033f3c87d4b3c661a7a420f38a9d09d101e1c619fcbcd4013d06c9,ca12e1f9bd55081c6e770739f86f3922e8e1ee6625edc2dbf4d8254815ad0298"
const INFURA_API_KEY = "99b6cb1b5fa74a03af447eaef46a18b5"
const privateKeys = PRIVATE_KEYS

/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */



module.exports = {

    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*",
        },
        rinkeby: {
            networkCheckTimeout: 10000,
            provider: function (){
                return new HDWalletProvider(
                //private key
                privateKeys.split(','),
                `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`
                //url to an ethereum node
                )
            },
            gas: 5500000,
            skipDryRun: true,
            network_id: 4,
        }
    },
    contracts_build_directory: './src/abis',
    contracts_directory: './src/contracts',


    // Set default mocha options here, use special reporters etc.
    mocha: {
        // timeout: 100000
    },

    // Configure your compilers
    compilers: {
        solc: {
            version: "0.5.0", // Fetch exact version from solc-bin (default: truffle's version)
            // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
            // settings: {          // See the solidity docs for advice about optimization and evmVersion
            optimizer: {
                enabled: true,
                runs: 200
            },
            //  evmVersion: "byzantium"
            // }
        },
    },
};