const express = require('express');
const router = express.Router();
const FinancialRecord = require('../models/FinancialRecord');

// Middleware to verify JWT token
const auth = require('../middleware/auth');

// Add new financial record
router.post('/', auth, async (req, res) => {
    try {
        const { date, monthlyIncome, rent, otherExpenses, roomExpenses, sipAmount } = req.body;
        
        // Calculate net saving
        const netSaving = monthlyIncome - (rent + otherExpenses + roomExpenses + sipAmount);

        const record = new FinancialRecord({
            userId: req.user.userId,
            date,
            monthlyIncome,
            rent,
            otherExpenses,
            roomExpenses,
            sipAmount,
            netSaving
        });

        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error creating record', error: error.message });
    }
});

// Get all financial records
router.get('/', auth, async (req, res) => {
    try {
        const records = await FinancialRecord.find({ userId: req.user.userId })
            .sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records', error: error.message });
    }
});

// Get financial summary
router.get('/summary', auth, async (req, res) => {
    try {
        const records = await FinancialRecord.find({ userId: req.user.userId });
        
        const summary = {
            totalIncome: records.reduce((sum, record) => sum + record.monthlyIncome, 0),
            totalExpenses: records.reduce((sum, record) => 
                sum + record.rent + record.otherExpenses + record.roomExpenses, 0),
            totalSavings: records.reduce((sum, record) => sum + record.netSaving, 0),
            totalSIP: records.reduce((sum, record) => sum + record.sipAmount, 0)
        };

        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating summary', error: error.message });
    }
});

// Delete financial record
router.delete('/:id', auth, async (req, res) => {
    try {
        const record = await FinancialRecord.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!record) {
            return res.status(404).json({ message: 'Record not found' });
        }

        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record', error: error.message });
    }
});

module.exports = router; 