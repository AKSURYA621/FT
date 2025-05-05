const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Add new transaction
router.post('/', auth, async (req, res) => {
    try {
        const {
            transactionType,
            personName,
            transactionDate,
            amount,
            recoveryDate,
            status
        } = req.body;
        
        const transaction = new Transaction({
            userId: req.user.userId,
            transactionType,
            personName,
            transactionDate,
            amount,
            recoveryDate,
            status
        });

        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error creating transaction', error: error.message });
    }
});

// Get all transactions
router.get('/', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId })
            .sort({ transactionDate: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions', error: error.message });
    }
});

// Get transaction summary
router.get('/summary', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.userId });
        
        const summary = {
            totalToReceive: transactions
                .filter(t => t.transactionType === 'given' && t.status === 'pending')
                .reduce((sum, transaction) => sum + transaction.amount, 0),
            totalToPay: transactions
                .filter(t => t.transactionType === 'taken' && t.status === 'pending')
                .reduce((sum, transaction) => sum + transaction.amount, 0)
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating summary', error: error.message });
    }
});

// Update transaction status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { status },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Error updating transaction', error: error.message });
    }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
});

module.exports = router; 