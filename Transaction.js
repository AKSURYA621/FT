const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionType: {
        type: String,
        enum: ['given', 'taken'],
        required: true
    },
    personName: {
        type: String,
        required: true
    },
    transactionDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    recoveryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema); 