# Financial Tracker Application

A web application for tracking personal finances, expenses, and transactions.

## Backend Setup

The backend is built with Python Flask and uses MySQL as the database.

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- MySQL (v5.7 or higher)

### Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following content:
```
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=mysql://root:password@localhost/financial_tracker
JWT_SECRET_KEY=your-secret-key-here
```

4. Start MySQL:
```bash
# On Windows
mysqld

# On macOS/Linux
sudo service mysqld start
```

### Running the Application

Start the Flask development server:
```bash
flask run
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token

### Financial Records
- `GET /api/records` - Get all financial records
- `POST /api/records` - Create a new financial record

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create a new expense

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction

All endpoints except `/api/register` and `/api/login` require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Frontend

The frontend is built with HTML, CSS, and JavaScript. It communicates with the backend API endpoints.

### Features
- User authentication
- Financial record management
- Expense tracking
- Transaction management
- Responsive design

## Security Notes

- Always use HTTPS in production
- Keep your JWT_SECRET_KEY secure
- Regularly backup your database
- Implement proper input validation
- Use strong passwords 