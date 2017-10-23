//*
import { assertOpcode } from './helpers/assertOpcode';
import { sharedSetup } from './helpers/setup';

const EarlyTokenSale = artifacts.require('EarlyTokenSale');

// testrpc -m "melt object asset crash now another usual cup pool during mad powder"\
//
//
// Available Accounts
// ==================
// (0) 0xce4c68a6347e78fb853ed14e2bb2910cabfe00a7 <-- deployer
// (1) 0x423d8ed622ef2b48fa05629e1314812f66c5e80f
// (2) 0xd62c96cd87dae2933cf2b7fafbcb757a6c84ad99
// (3) 0x5a7088e57a21d581c95930ce4b3dbb9ab097b23e
// (4) 0xd64bd119d72b3906d500bddf8295efc0d8301a93
// (5) 0x3de8bdb2597ab29e289a34c42602418bfcd2962b
// (6) 0xc08929b891afa58f6c0ca57dddd25224be5dc01b
// (7) 0x6a30763e7406e0e9c8ed6326f5e3fe0ef82d7d40 <-- multisig owner 1
// (8) 0xaf46e99cfc75068ea255f995eb5efbc55a7bedc7 <-- multisig owner 2
// (9) 0xbf88b620ef8eef56a66fcef17a8fbafc8bf0dda2 <-- multisig owner 3
// 
// Private Keys
// ==================
// (0) 5adc42d2a8afeea43ce06c2c33aca4bb6d48e44a0ce7703cfe93d0d37ee126f5
// (1) 705b66458cb47ce0e73ae65c8403e05ea38ef7939a6024366e9359a466473799
// (2) 491f68e633115c0dc0589d7a35c13c62b3bd5b50c2efb028d96c57a7a7bbe673
// (3) aeb2e15acd14c5780e1568e922684358c980f532c4e474e74bfc4ea7b83be98c
// (4) 298c721f290ac9788bd0099dc73c23e0f328747311849a5560081ff757837bfc
// (5) 8bbf6dcafcfe58d28862fe9fb562111517f1a052c266a920c844f91aecff19e8
// (6) 71a4698e445605cf3e479b3cf55b7bd84082bedda7cbf3edc1e9faab54613c5b
// (7) 498971c17a7eb841cefae57ce87ac741b4f234b091713d0d26d0fc65e0d13740
// (8) 37e49db778a5e759741d241ac83fe4cd904cd00fa29e056c5483125c6538d9fb
// (9) 9b51e824255e11da621fb8e37e6620d6afe2cee5c3def54e4d219e533b5dbd2d

// HD Wallet
// ==================
// Mnemonic:      melt object asset crash now another usual cup pool during mad powder
// Base HD Path:  m/44'/60'/0'/0/{account_index}

contract('DataBrokerDaoToken', function(accounts) {
  return false;
  it('should return a totalSupply of 0 after construction', async function() {
    const { token } = await sharedSetup(accounts);
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
  });

  it('should return correct balances after generation', async function() {
    const { token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[1], 100);
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 100);
  });

  it('should fail when trying to transfer', async function() {
    const { wallet, token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[0], web3.toWei('100'));
    const { timestamp } = web3.eth.getBlock('latest');
    const sale = await EarlyTokenSale.new(
      timestamp - 3600,
      timestamp + 3600,
      wallet.address,
      token.address
    );
    await token.changeController(sale.address);
    try {
      await token.transfer(accounts[2], web3.toWei('10'));
    } catch (error) {
      return assertOpcode(error);
    }
    assert.fail('should have errored');
  });

  it('should return the correct allowance amount after approval', async function() {
    const { token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[0], 100);
    await token.enableTransfers(true);
    const approve = await token.approve(accounts[1], 90);
    const allowance = await token.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 90);
  });

  it('should not fail when trying to transfer with transfer enabled', async function() {
    const { token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[0], 100);
    await token.enableTransfers(true);
    await token.transfer(accounts[1], 10);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 90);
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 10);
  });

  it('should do nothing when trying to transfer more than balance', async function() {
    const { token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[0], 100);
    await token.enableTransfers(true);
    await token.transfer(accounts[1], 101);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 100);
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 0);
  });

  it('should return correct balances after transfering from another account', async function() {
    const { token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[0], 100);
    await token.enableTransfers(true);
    const approve = await token.approve(accounts[1], 90);
    const transferFrom = await token.transferFrom(
      accounts[0],
      accounts[2],
      90,
      { from: accounts[1] }
    );
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 10);
    const balance1 = await token.balanceOf(accounts[2]);
    assert.equal(balance1, 90);
    const balance2 = await token.balanceOf(accounts[1]);
    assert.equal(balance2, 0);
  });

  it('should do nothing when trying to transfer more than allowed', async function() {
    const { token } = await sharedSetup(accounts);
    await token.generateTokens(accounts[0], 100);
    await token.enableTransfers(true);
    await token.approve(accounts[1], 99);
    await token.transferFrom(accounts[0], accounts[2], 100, {
      from: accounts[1],
    });
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 100);
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 0);
    const balance2 = await token.balanceOf(accounts[2]);
    assert.equal(balance1.toNumber(), 0);
  });
});
//*/
