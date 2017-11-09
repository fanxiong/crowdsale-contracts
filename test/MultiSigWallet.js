import { assertOpcode } from './helpers/assertOpcode';
import { blocktravel } from './helpers/timetravel';

const MultiSigWallet = artifacts.require('MultiSigWallet');

contract('MultiSigWallet', function(accounts) {
  return false;
	//blocktravel(100, accounts);

	it('应该可以增加或删除owners', async function(){
		const amount7_0 = await web3.eth.getBalance(accounts[7]);
		//先给accounts[7]转100eth
		await web3.eth.sendTransaction({from:accounts[0], to:accounts[7], value:web3.toWei(100, 'ether'), gas:200000});
		const amount7_1 = await web3.eth.getBalance(accounts[7]);
		assert.equal(amount7_1.minus(amount7_0.plus(web3.toWei(100, 'ether'))), 0);
		const wallet = await MultiSigWallet.new(
			[
				accounts[7], // account_index: 7
				accounts[8], // account_index: 8
				accounts[9], // account_index: 9
			],
			2
		);
		//执行用户不是accounts[0],所以需要指定`from`,`gas`，否则会因为权限不足而报错:"Error: VM Exception while processing transaction: invalid opcode"
		//此函数返回是一个Object(txId, receipt, ...),并非updateId
		const trans_0 = await wallet.addOwner(accounts[6], {from:accounts[7],gas:200000});
		//assert.isAbove(updateId, -1); //there will be 0
		//同意增加控制用户
		await wallet.confirmChangeOwner(0, true, {from:accounts[8],gas:200000});
		const ownerNum = await wallet.getOwners();
		return;
		assert.equal(ownerNum.length, 4);
		//删除刚刚增加的owner
		const trans_1 = await wallet.removeOwner(accounts[6], {from:accounts[7],gas:200000});
		await wallet.confirmChangeOwner(0, true, {from:accounts[8],gas:200000});
		assert.equal(ownerNum.length, 3);
		//await wallet.confirmChangeOwner(updateId, true);
		//const nOwnerNum = await wallet.getOwners().length;
		//assert.equal(nOwnerNum, 4);
	});

/*
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
*/
});