require('babel-register');
require('babel-polyfill');

var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic =
  process.env.SEED ||
  'rather rather rather rather rather rather rather rather rather rather rather rather';

module.exports = {
  networks: {
    development: {
      host: '192.168.1.111',
      port: 8546,
      network_id: '*',
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8545, // <-- Use port 8555
      gas: 3000000, // <-- Use this high gas value
      gasPrice: 250000, // <-- Use this low gas price
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/'),
      network_id: '4',
    },
    mainnet: {
      provider: new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/'),
      network_id: '1',
    },
  },
};
