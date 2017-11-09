import {
  getTokenCrowdSaleDuringPreSale,
} from './helpers/setup';
import { assertOpcode } from './helpers/assertOpcode';
import { blocktravel } from './helpers/timetravel';

const TokenCrowdsale = artifacts.require('TokenCrowdsale');
const MultiSigWallet = artifacts.require('MultiSigWallet');
const DataBrokerDaoToken = artifacts.require('DataBrokerDaoToken');
const FailingMockToken = artifacts.require('FailingMockToken');


const tokensPerEther = 20000; 

contract('TokenCrowdsale', function(accounts) {
  //blocktravel(100, accounts);


  it('should work when trying to send ether ICO sale by someone in whitelist', async function() {
    const sendEther1 = 1, sendEther2 = 1;
    const { sale, token, wallet } = await getTokenCrowdSaleDuringPreSale(accounts);
    await sale.addManyToWhiteList(accounts.slice(0,4));
    //send a few eth for join whitelist
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    });
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(sendEther1*tokensPerEther, 'ether'));

    var balanceWallet = await web3.eth.getBalance(wallet.address);
    assert.equal(balanceWallet.toNumber(), web3.toWei(sendEther1, 'ether'));

    //outside of whitelist should be recorde in waitingKYC
    const arg0 = {
      from: accounts[1],
      to: sale.address,
      value: web3.toWei(sendEther2, 'ether'),
      gas: 300000,
    };
    //console.log('arg0:', arg0);
    await web3.eth.sendTransaction(arg0);
    //const totalSupply = await token.totalSupply();
    //assert.equal(totalSupply.toNumber(), web3.toWei(sendEther1*tokensPerEther + sendEther2*tokensPerEther, 'ether')); //Don't use "(sendEther1+sendEther2) * tokensPerEther", that will be show as 20019999999999996000000
    const totalCollected = await sale.totalCollected();
    assert.equal(totalCollected.toNumber(), web3.toWei(sendEther1+sendEther2, 'ether'));
    const balance1 = await token.balanceOf(accounts[1]);
    assert.equal(balance1.toNumber(), web3.toWei(sendEther2*tokensPerEther, 'ether'));
  });


  it('should not work when trying to send ether ICO sale by someone until add him to whitelist', async function() {
    const sendEther1 = 1, sendEther2 = 1;
    const { sale, token, wallet } = await getTokenCrowdSaleDuringPreSale(accounts);
    await sale.changeNeedWhiteList(true);
    //throw when user not in whiteList
    try{
	    await web3.eth.sendTransaction({
	      from: accounts[0],
	      to: sale.address,
	      value: web3.toWei(sendEther1, 'ether'),
	      gas: 300000,
	    });
	}catch(err){
		assertOpcode(err);
	}
    var balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(0, 'ether'));

    const balanceWallet = await web3.eth.getBalance(wallet.address);
    assert.equal(balanceWallet.toNumber(), web3.toWei(0, 'ether'));

    await sale.addOneToWhiteList(accounts[0]);
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: sale.address,
      value: web3.toWei(sendEther1, 'ether'),
      gas: 300000,
    });
    balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(sendEther1*tokensPerEther, 'ether'));
  });


  it('should not work when trying to send ether ICO sale by someone in whitelist', async function() {
  	return;

    const sendEther1 = 1, sendEther2 = 1;
    const { sale, token, wallet } = await getTokenCrowdSaleDuringPreSale(accounts);
    //throw when user not in whiteList
    try{
	    await web3.eth.sendTransaction({
	      from: accounts[0],
	      to: sale.address,
	      value: web3.toWei(sendEther1, 'ether'),
	      gas: 300000,
	    });
	}catch(err){
		assertOpcode(err);
	}
    const balance0 = await token.balanceOf(accounts[0]);
    assert.equal(balance0.toNumber(), web3.toWei(0, 'ether'));

    balanceWallet = await web3.eth.getBalance(wallet.address);
    assert.equal(balanceWallet.toNumber(), web3.toWei(sendEther1+sendEther2, 'ether'));
  });


});
