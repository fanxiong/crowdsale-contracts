import { timetravel } from './timetravel';

const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');

export async function getTokenBeforeSale(accounts) {
  const token = await DataBrokerDaoToken.new();
  //const { wallet, token } = await sharedSetup(accounts);
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp + 3600,
    timestamp + 7200,
    accounts[7],  //without multisign wallet, account[7] is controller
    token.address
  );
  await token.changeController(sale.address);
  return {
    //wallet,
    token,
    sale,
  };
}

export async function getTokenDuringSale(accounts) {
  const token = await DataBrokerDaoToken.new();
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp - 3600,
    timestamp + 3600,
    accounts[7],  //without multisign wallet, account[7] is controller
    token.address
  );
  await token.changeController(sale.address);
  return {
    token,
    sale,
  };
}

export async function getSaleBeforeSale(accounts) {
  const { wallet, token } = await sharedSetup(accounts);
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp + 3600,
    timestamp + 7200,
    wallet.address,
    token.address
  );
  await token.changeController(sale.address);
  return {
    wallet,
    token,
    sale,
  };
}

export async function getSaleAfterSale(accounts) {
  const { wallet, token } = await sharedSetup(accounts);
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp - 3600,
    timestamp + 30,
    wallet.address,
    token.address
  );
  await token.changeController(sale.address);
  await timetravel(60);
  return {
    wallet,
    token,
    sale,
  };
}

export async function getSaleDuringSale(accounts) {
  const { wallet, token } = await sharedSetup(accounts);
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp - 3600,
    timestamp + 3600,
    wallet.address,
    token.address
  );
  await token.changeController(sale.address);
  return {
    wallet,
    token,
    sale,
  };
}

export async function sharedSetup(accounts) {
  const wallet = await MultiSigWallet.new(
    [
      accounts[7], // account_index: 7
      accounts[8], // account_index: 8
      accounts[9], // account_index: 9
    ],
    2
  );
  const token = await DataBrokerDaoToken.new();
  return { wallet, token };
}
