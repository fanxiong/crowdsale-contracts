pragma solidity ^0.4.15;

import "./MultiSigWallet.sol";


/// @title Multisignature wallet with daily limit - Allows an owner to withdraw a daily limit without multisig.
/// @author Stefan George - <stefan.george@consensys.net>
contract MultiSigWalletWithDailyLimit is MultiSigWallet {

    /*
     *  Events
     */
    event DailyLimitChange(uint dailyLimit);

    /*
     *  Storage
     */
    uint public dailyLimit;
    uint public lastDay;
    uint public spentToday;

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners, required number of confirmations and daily withdraw limit.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @param _dailyLimit Amount in wei, which can be withdrawn without confirmations on a daily basis.
    function MultiSigWalletWithDailyLimit(address[] _owners, uint _required, uint _dailyLimit)
        public
        MultiSigWallet(_owners, _required)
    {
        dailyLimit = _dailyLimit;
    }

    /// @dev Allows to change the daily limit. Transaction has to be sent by wallet.
    /// @param _dailyLimit Amount in wei.
    function changeDailyLimit(uint _dailyLimit)
        public
        onlyOwner
    {
        dailyLimit = _dailyLimit;
        DailyLimitChange(_dailyLimit);
    }

    /// @dev Allows anyone to execute a confirmed transaction or ether withdraws until daily limit is reached.
    /// @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
        public
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        Transaction storage _tx = transactions[transactionId];
        bool _confirmed = isConfirmed(transactionId);
        if (_confirmed || _tx.data.length == 0 && isUnderLimit(_tx.value)) {
            _tx.executed = true;
            if (!_confirmed)
                spentToday += _tx.value;
            if (_tx.destination.call.value(_tx.value)(_tx.data))
                Execution(transactionId);
            else {
                ExecutionFailure(transactionId);
                _tx.executed = false;
                if (!_confirmed)
                    spentToday -= _tx.value;
            }
        }
    }

    /*
     * Internal functions
     */
    /// @dev Returns if amount is within daily limit and resets spentToday after one day.
    /// @param amount Amount to withdraw.
    /// @return Returns if amount is under daily limit.
    function isUnderLimit(uint amount)
        internal
        returns (bool)
    {
        if (now > lastDay + 24 hours) {
            lastDay = now;
            spentToday = 0;
        }
        if (spentToday + amount > dailyLimit || spentToday + amount < spentToday)
            return false;
        return true;
    }

    /*
     * Web3 call functions
     */
    /// @dev Returns maximum withdraw amount.
    /// @return Returns amount.
    function calcMaxWithdraw()
        public
        constant
        returns (uint)
    {
        if (now > lastDay + 24 hours)
            return dailyLimit;
        if (dailyLimit < spentToday)
            return 0;
        return dailyLimit - spentToday;
    }
}