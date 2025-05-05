const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Add new expense
router.post('/', auth, async (req, res) => {
    try {
        const { date, expenseType, amount } = req.body;
        
        const expense = new Expense({
            userId: req.user.userId,
            date,
            expenseType,
            amount
        });

        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense', error: error.message });
    }
});

// Get all expenses
router.get('/', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.userId })
            .sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

// Get expense summary
router.get('/summary', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.userId });
        
        const summary = {
            totalDelayedExpenses: expenses
                .filter(e => e.expenseType === 'delayed')
                .reduce((sum, expense) => sum + expense.amount, 0),
            totalRoomExpenses: expenses
                .filter(e => e.expenseType === 'room')
                .reduce((sum, expense) => sum + expense.amount, 0),
            totalAmountToPay: expenses
                .reduce((sum, expense) => sum + expense.amount, 0)
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating summary', error: error.message });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
});

module.exports = router; 