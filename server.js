const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/financial-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const User = mongoose.model('User', {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const FinancialRecord = mongoose.model('FinancialRecord', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    monthlyIncome: { type: Number, required: true },
    rent: { type: Number, required: true },
    otherExpenses: { type: Number, required: true },
    roomExpenses: { type: Number, required: true },
    sipAmount: { type: Number, required: true }
});

const Expense = mongoose.model('Expense', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['delayed', 'room'] }
});

const Transaction = mongoose.model('Transaction', {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: ['given', 'taken'] },
    personName: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    recoveryDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['pending', 'completed'] }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Routes
app.get('/api/records', authenticateToken, async (req, res) => {
    try {
        const records = await FinancialRecord.find({ userId: req.user.id });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/records', authenticateToken, async (req, res) => {
    try {
        const record = new FinancialRecord({
            userId: req.user.id,
            ...req.body
        });
        await record.save();
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const expense = new Expense({
            userId: req.user.id,
            ...req.body
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const transaction = new Transaction({
            userId: req.user.id,
            ...req.body
        });
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 