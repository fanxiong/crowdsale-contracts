//*
import {
  getTokenBeforeSale,
  getTokenDuringSale,
  getPreSaleDuringPreSale,
  getSaleBeforePreSale,
  getSaleDuringPreSale,
  getSaleBeforeSale,
  getSaleAfterSale,
  getSaleDuringSale,
} from './helpers/setup';
import { assertOpcode } from './helpers/assertOpcode';
import { blocktravel } from './helpers/timetravel';

const TNBToken = artifacts.require('TNBToken');
const PreTokenSale = artifacts.require('PreTokenSale');
const EarlyTokenSale = artifacts.require('EarlyTokenSale');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');
const FailingMockToken = artifacts.require('FailingMockToken');

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

const tokensPerEther = 20000; 

contract('PreTokenSale', function(accounts) {
  blocktravel(100, accounts);

/*
  it('should work when trying to send ether before the sale by anyone', async function() {
    const sendEther = 0.001;
    const { sale, token, wallet } = await getSaleBeforeSale(accounts);
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    await web3.eth.sendTransaction(arg0);
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), web3.toWei(tokensPerEther * sendEther, 'ether')); //AssertionError: expected 2e+21 to equal '1200000000000000000000'
    const totalCollected = await sale.totalCollected(); //public 变量，直接调用，不使用call()
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther, 'ether')); //expected 1000000000000000 to equal '1000000000000000000'
    const balance0 = await token.balanceOf(accounts[1]);
    assert.equal(balance0.toNumber(), web3.toWei(tokensPerEther * sendEther, 'ether'));
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), web3.toWei(sendEther, 'ether'));
  });

  it('should work when trying to send ether less than 1% eth before the sale by normal user(for validate and add to whitelist)', async function() {
    const sendEther = 0.001;
    const { sale, token, wallet } = await getSaleBeforeSale(accounts);
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    await web3.eth.sendTransaction(arg0);
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), web3.toWei(tokensPerEther * sendEther, 'ether'));
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther, 'ether'));
    const balance7 = await token.balanceOf(accounts[1]);
    assert.equal(balance7.toNumber(), web3.toWei(tokensPerEther * sendEther, 'ether'));
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), web3.toWei(sendEther, 'ether'));
  });

  it('should fail when trying to send ether more than 1% eth before the sale', async function() {
    const { sale, token, wallet } = await getSaleBeforeSale(accounts);
    try {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: sale.address,
        value: web3.toWei(1, 'ether'),
        gas: 300000,
      });
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), 0);
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 0);
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), 0);
  });

  it('should fail when trying to send ether during the sale by someone did not validate, even the controller member(controller is contract)', async function() {
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    / **
    const controller = await sale.controller();
    console.log('controller:', controller);
    assert(controller, accounts[7]);
    ** /
    const arg0 = {
      from: accounts[7],
      to: sale.address,
      value: web3.toWei(1, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    try{
      await web3.eth.sendTransaction(arg0);
    }catch(error){
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), web3.toWei(0, 'ether'));
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(0, 'ether'));
    const balance0 = await token.balanceOf(accounts[7]);
    assert.equal(balance0.toNumber(), web3.toWei(0, 'ether'));
    const walletBalance = web3.eth.getBalance(sale.address);
    assert.equal(walletBalance.toNumber(), web3.toWei(0, 'ether'));
  });

  it('should fail when trying to send ether during the sale and user ouside of whitelist', async function() {
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(1, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    try {
      await web3.eth.sendTransaction(arg0);
    }catch (error){
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), web3.toWei(0, 'ether'));
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(0, 'ether'));
    const balance0 = await token.balanceOf(accounts[1]);
    assert.equal(balance0.toNumber(), web3.toWei(0, 'ether'));
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), web3.toWei(0, 'ether'));
  });

  it('should work when trying to send ether during the sale and user inside whitelist', async function() {
    const sendEther1 = 0.001, sendEther2 = 1;
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    //send a few eth for join whitelist
    await web3.eth.sendTransaction({
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    });
    await sale.addOneToWhiteList(accounts[1]);
    const inWhitelist = await sale.whiteList(accounts[1]);
    assert.equal(inWhitelist, true);
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther2, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    await web3.eth.sendTransaction(arg0);
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), web3.toWei(sendEther1*tokensPerEther + sendEther2*tokensPerEther, 'ether')); //Don't use "(sendEther1+sendEther2) * tokensPerEther", that will be show as 20019999999999996000000
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther1 + sendEther2, 'ether'));
    const balance0 = await token.balanceOf(accounts[1]);
    assert.equal(balance0.toNumber(), web3.toWei(sendEther1*tokensPerEther + sendEther2*tokensPerEther, 'ether'));
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), web3.toWei(sendEther1+sendEther2, 'ether'));
  });

  it('should fail when trying to send ether after the sale', async function() {
    const { sale, token, wallet } = await getSaleAfterSale(accounts);
    try {
      await web3.eth.sendTransaction({
        from: accounts[1],
        to: sale.address,
        value: web3.toWei(1, 'ether'),
        gas: 300000,
      });
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), 0);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 0);
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), 0);
  });

  it('should fail when trying to send ether after the sale by the controller', async function() {
    const { sale, token, wallet } = await getSaleAfterSale(accounts);
    try {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: sale.address,
        value: web3.toWei(1, 'ether'),
        gas: 300000,
      });
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), 0);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 0);
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), 0);
  });

  it('should be able to finalise after the sale', async function() {
    const { sale, token, wallet } = await getSaleAfterSale(accounts);
    await sale.finalizeSale();
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 225000000 * 0.35 * 10 ** 18);
    const balance0 = await token.balanceOf(wallet.address);
    assert.equal(balance0.toNumber(), 225000000 * 0.35 * 10 ** 18);
  });

  it('should not be able to finalise twice after the sale', async function() {
    const { sale, token, wallet } = await getSaleAfterSale(accounts);
    await sale.finalizeSale();
    try {
      await sale.finalizeSale();
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 225000000 * 0.35 * 10 ** 18);
    const balance0 = await token.balanceOf(wallet.address);
    assert.equal(balance0.toNumber(), 225000000 * 0.35 * 10 ** 18);
  });

  it('should not be able to finalise by anyone', async function() {
    const { sale, token, wallet } = await getSaleAfterSale(accounts);
    try {
      await sale.finalizeSale({ from: accounts[7] });
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
    const balance0 = await token.balanceOf(wallet.address);
    assert.equal(balance0.toNumber(), 0);
  });

  it('should fail when trying to send ether when the sale is pauzed', async function() {
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    await sale.pauseContribution();
    try {
      web3.eth.sendTransaction({
        from: accounts[0],
        to: sale.address,
        value: web3.toWei(1, 'ether'),
        gas: 200000,
      });
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), 0);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 0);
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), 0);
  });

  it('should work when trying to send ether when the sale is unpauzed', async function() {
    const sendEther = 1;
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    await sale.pauseContribution();
    await sale.resumeContribution();
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: sale.address,
      value: web3.toWei(sendEther, 'ether'),
      gas: 300000,
    });
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), web3.toWei(sendEther*tokensPerEther, 'ether'));
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther, 'ether'));
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(sendEther*tokensPerEther, 'ether'));
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), web3.toWei(sendEther, 'ether'));
  });

  it('should be able to get mistakenly sent ether', async function() {
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    await sale.claimTokens(0);
  });

  it('should be able to get mistakenly sent tokens', async function() {
    const { sale, token, wallet } = await getSaleDuringSale(accounts);
    const newToken = await TNBToken.new(
      'Some Token',
      18,
      'SOME',
      true
    );

    await sale.claimTokens(newToken.address);
  });

  it('should fail when the token generation fails', async function() {
    const wallet = await MultiSigWallet.new(
      [
        accounts[7], // account_index: 7
        accounts[8], // account_index: 8
        accounts[9], // account_index: 9
      ],
      2
    );
    const token = await FailingMockToken.new();
    const { timestamp } = web3.eth.getBlock('latest');
    const sale = await EarlyTokenSale.new(
      timestamp - 3600,
      timestamp + 3600,
      wallet.address,
      token.address
    );
    await token.changeController(sale.address);
    try {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: sale.address,
        value: web3.toWei(1, 'ether'),
        gas: 300000,
      });
    } catch (error) {
      assertOpcode(error);
    }
    const totalSupply = await token.totalSupply();
    assert.equal(totalSupply.toNumber(), 0);
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), 0);
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), 0);
    const walletBalance = web3.eth.getBalance(wallet.address);
    assert.equal(walletBalance.toNumber(), 0);
  });

  it('should work when trying to send ether before pre sale by someone in whitelist or not', async function() {
    const sendEther1 = 999, sendEther2 = 2;
    const { sale, token, wallet } = await getSaleDuringPreSale(accounts);
    //send a few eth for join whitelist
    await sale.setDailyInfo(0,90,1000);
    await sale.addOneToWhiteList(accounts[0]);
    const inWhitelist = await sale.whiteList(accounts[0]);
    assert.equal(inWhitelist, true);
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    });
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(sendEther1*tokensPerEther*10/9, 'ether'));

    //outside of whitelist should be recorde in waitingKYC
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    await web3.eth.sendTransaction(arg0);
    //const totalSupply = await token.totalSupply();
    //assert.equal(totalSupply.toNumber(), web3.toWei(sendEther1*tokensPerEther + sendEther2*tokensPerEther, 'ether')); //Don't use "(sendEther1+sendEther2) * tokensPerEther", that will be show as 20019999999999996000000
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther1*2, 'ether'));
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 0);
    const log = await sale.waitingKYC(accounts[1]);
    const balanceW = log[1];  //map converted an array
    assert.equal(balanceW.toNumber(), web3.toWei(sendEther1*tokensPerEther*10/9, 'ether'));
    //const walletBalance = web3.eth.getBalance(wallet.address);
    //assert.equal(walletBalance.toNumber(), web3.toWei(sendEther1+sendEther2, 'ether'));
  });
*/

  it('should work when trying to send ether pre sale by someone', async function() {
    const sendEther1 = 99, sendEther2 = 2, tokensPerEther = 22222;
    const { sale, token, wallet } = await getPreSaleDuringPreSale(accounts);
    //send a few eth for join whitelist
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    });
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(sendEther1*tokensPerEther, 'ether'));

    const balanceWallet = await web3.eth.getBalance(wallet.address);
    assert.equal(balanceWallet.toNumber(), web3.toWei(sendEther1, 'ether'));
    return;

    //outside of whitelist should be recorde in waitingKYC
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    await web3.eth.sendTransaction(arg0);
    //const totalSupply = await token.totalSupply();
    //assert.equal(totalSupply.toNumber(), web3.toWei(sendEther1*tokensPerEther + sendEther2*tokensPerEther, 'ether')); //Don't use "(sendEther1+sendEther2) * tokensPerEther", that will be show as 20019999999999996000000
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther1*2, 'ether'));
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), 0);
    const log = await sale.waitingKYC(accounts[1]);
    const balanceW = log[1];  //map converted an array
    assert.equal(balanceW.toNumber(), web3.toWei(sendEther1*tokensPerEther*10/9, 'ether'));
    //const walletBalance = web3.eth.getBalance(wallet.address);
    //assert.equal(walletBalance.toNumber(), web3.toWei(sendEther1+sendEther2, 'ether'));
  });

});
//*/

