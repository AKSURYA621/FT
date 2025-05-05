const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    monthlyIncome: {
        type: Number,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    otherExpenses: {
        type: Number,
        required: true
    },
    roomExpenses: {
        type: Number,
        required: true
    },
    sipAmount: {
        type: Number,
        required: true
    },
    netSaving: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FinancialRecord', financialRecordSchema); 