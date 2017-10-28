const TestPayable = artifacts.require('TestPayable');

contract('TestPayable', function(accounts) {
	return false;
	const owner = accounts[0];
	const userA = accounts[1];
	const userB = accounts[2];

	it('向合约发送ETH', async function(){
		const PayableToken = await TestPayable.new();
		const balanceO = await web3.eth.getBalance(owner);
		const balanceA = await web3.eth.getBalance(userA);
		//console.log('balanceA:', balanceA.toString())
		const balanceB = await web3.eth.getBalance(userB);
		const balance_contract = await web3.eth.getBalance(PayableToken.address);
		const txId = await web3.eth.sendTransaction({
			from: userA, 
			to: PayableToken.address, 
			value: 10,
			//gas: 200000
		});
		//console.log(txId);
		//console.log('gasprice::', web3.eth.getTransaction(txId))
		const balanceO_1 = await web3.eth.getBalance(owner);
		//console.log("balance type::", typeof balanceO_1);
		//console.log("balanceO_1:", balanceO_1.toNumber());
		//console.log("balanceO:", balanceO.toNumber() - 1);
		assert.equal(balanceO_1.eq(balanceO), true);

		const balanceA_1 = await web3.eth.getBalance(userA);
		//console.log('balanceA_1:', balanceA_1.toString())
		assert.equal(balanceA.sub(balanceA_1).toNumber(), 1);
		//userA token 数增加
		const n_tokenA = await PayableToken.balances(userA);
		assert.equal(n_tokenA.toNumber(), 100);

		const balance_contract_1 = await web3.eth.getBalance(PayableToken.address);
		assert.equal(balance_contract_1.toNumber(), balance_contract.toNumber() + 1);

	});

	it('从合约提现ETH', async function(){
		const PayableToken = await TestPayable.new();
		const balanceO = await web3.eth.getBalance(owner);
		const balanceA = await web3.eth.getBalance(userA);
		const balanceB = await web3.eth.getBalance(userB);
		const balance_contract = await web3.eth.getBalance(PayableToken.address);
		await web3.eth.sendTransaction({
			from: owner, 
			to: PayableToken.address, 
			value: web3.toWei(1, 'ether')
		});
		const balanceO_1 = await web3.eth.getBalance(owner);
		//console.log("balanceO_1:", balanceO_1.toNumber())
		assert.equal(balanceO_1.toNumber(), balanceO.toNumber() - web3.toWei(1, 'ether'));
		const balanceA_1 = await web3.eth.getBalance(userA);
		assert.equal(balanceA_1.toNumber(), balanceA.toNumber() - web3.toWei(1, 'ether'));
		const balance_contract_1 = await web3.eth.getBalance(PayableToken.address);
		assert.equal(balance_contract_1.toNumber(), balance_contract.toNumber() + web3.toWei(1, 'ether'));
	})
});