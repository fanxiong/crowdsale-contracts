import { timetravel } from './timetravel';

const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory');
const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');

export async function getSaleBeforeSale(accounts) {
  const { factory, wallet, token } = await sharedSetup(accounts);
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp + 3600,
    timestamp + 7200,
    wallet.address,
    token.address
  );
  await token.changeController(sale.address);
  return {
    factory,
    wallet,
    token,
    sale,
  };
}

export async function getSaleAfterSale(accounts) {
  const { factory, wallet, token } = await sharedSetup(accounts);
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
    factory,
    wallet,
    token,
    sale,
  };
}

export async function getSaleDuringSale(accounts) {
  const { factory, wallet, token } = await sharedSetup(accounts);
  const { timestamp } = web3.eth.getBlock('latest');
  const sale = await EarlyTokenSale.new(
    timestamp - 3600,
    timestamp + 3600,
    wallet.address,
    token.address
  );
  await token.changeController(sale.address);
  return {
    factory,
    wallet,
    token,
    sale,
  };
}

export async function sharedSetup(accounts) {
  const factory = await MiniMeTokenFactory.new();
  const wallet = await MultiSigWallet.new(
    [
      accounts[7], // account_index: 7
      accounts[8], // account_index: 8
      accounts[9], // account_index: 9
    ],
    2
  );
  const token = await DataBrokerDaoToken.new(factory.address);
  return { factory, wallet, token };
}
