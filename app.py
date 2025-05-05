from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_restful import Api, Resource
from flask_validator import Validator
from marshmallow import Schema, fields, validate
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv
from werkzeug.exceptions import HTTPException
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
api = Api(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql://root:password@localhost/financial_tracker')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    financial_records = db.relationship('FinancialRecord', backref='user', lazy=True)
    expenses = db.relationship('Expense', backref='user', lazy=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)

class FinancialRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    monthly_income = db.Column(db.Float, nullable=False)
    rent = db.Column(db.Float, nullable=False)
    other_expenses = db.Column(db.Float, nullable=False)
    room_expenses = db.Column(db.Float, nullable=False)
    sip_amount = db.Column(db.Float, nullable=False)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(20), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(20), nullable=False)
    person_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    recovery_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)

# Error Handlers
@app.errorhandler(HTTPException)
def handle_http_error(error):
    response = {
        'error': error.name,
        'message': error.description
    }
    return jsonify(response), error.code

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"An error occurred: {str(error)}")
    response = {
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }
    return jsonify(response), 500

# Validation Schemas
class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))

class FinancialRecordSchema(Schema):
    date = fields.Date(required=True)
    monthly_income = fields.Float(required=True, validate=validate.Range(min=0))
    rent = fields.Float(required=True, validate=validate.Range(min=0))
    other_expenses = fields.Float(required=True, validate=validate.Range(min=0))
    room_expenses = fields.Float(required=True, validate=validate.Range(min=0))
    sip_amount = fields.Float(required=True, validate=validate.Range(min=0))

class ExpenseSchema(Schema):
    date = fields.Date(required=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    type = fields.Str(required=True, validate=validate.OneOf(['delayed', 'room']))

class TransactionSchema(Schema):
    type = fields.Str(required=True, validate=validate.OneOf(['given', 'taken']))
    person_name = fields.Str(required=True, validate=validate.Length(min=2))
    date = fields.Date(required=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    recovery_date = fields.Date(required=True)
    status = fields.Str(required=True, validate=validate.OneOf(['pending', 'completed']))

# API Resources
class UserRegistration(Resource):
    def post(self):
        try:
            data = request.get_json()
            schema = UserSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            if User.query.filter_by(username=data['username']).first():
                return {'error': 'Username already exists'}, 400

            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            user = User(username=data['username'], password=hashed_password.decode('utf-8'))
            db.session.add(user)
            db.session.commit()

            return {'message': 'User created successfully'}, 201
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            db.session.rollback()
            return {'error': 'Internal Server Error'}, 500

class UserLogin(Resource):
    def post(self):
        try:
            data = request.get_json()
            schema = UserSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            user = User.query.filter_by(username=data['username']).first()
            if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password.encode('utf-8')):
                return {'error': 'Invalid username or password'}, 401

            access_token = create_access_token(identity=user.id)
            return {'token': access_token}, 200
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

class FinancialRecordResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            records = FinancialRecord.query.filter_by(user_id=user_id).all()
            return [{
                'id': record.id,
                'date': record.date.strftime('%Y-%m-%d'),
                'monthly_income': record.monthly_income,
                'rent': record.rent,
                'other_expenses': record.other_expenses,
                'room_expenses': record.room_expenses,
                'sip_amount': record.sip_amount
            } for record in records], 200
        except Exception as e:
            logger.error(f"Get records error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            schema = FinancialRecordSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            record = FinancialRecord(
                user_id=user_id,
                date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
                monthly_income=data['monthlyIncome'],
                rent=data['rent'],
                other_expenses=data['otherExpenses'],
                room_expenses=data['roomExpenses'],
                sip_amount=data['sipAmount']
            )
            db.session.add(record)
            db.session.commit()
            return {'message': 'Record created successfully'}, 201
        except Exception as e:
            logger.error(f"Create record error: {str(e)}")
            db.session.rollback()
            return {'error': 'Internal Server Error'}, 500

class ExpenseResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            expenses = Expense.query.filter_by(user_id=user_id).all()
            return [{
                'id': expense.id,
                'date': expense.date.strftime('%Y-%m-%d'),
                'amount': expense.amount,
                'type': expense.type
            } for expense in expenses], 200
        except Exception as e:
            logger.error(f"Get expenses error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            schema = ExpenseSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            expense = Expense(
                user_id=user_id,
                date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
                amount=data['amount'],
                type=data['type']
            )
            db.session.add(expense)
            db.session.commit()
            return {'message': 'Expense created successfully'}, 201
        except Exception as e:
            logger.error(f"Create expense error: {str(e)}")
            db.session.rollback()
            return {'error': 'Internal Server Error'}, 500

class TransactionResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            transactions = Transaction.query.filter_by(user_id=user_id).all()
            return [{
                'id': transaction.id,
                'type': transaction.type,
                'person_name': transaction.person_name,
                'date': transaction.date.strftime('%Y-%m-%d'),
                'amount': transaction.amount,
                'recovery_date': transaction.recovery_date.strftime('%Y-%m-%d'),
                'status': transaction.status
            } for transaction in transactions], 200
        except Exception as e:
            logger.error(f"Get transactions error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            schema = TransactionSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            transaction = Transaction(
                user_id=user_id,
                type=data['type'],
                person_name=data['personName'],
                date=datetime.strptime(data['date'], '%Y-%m-%d').date(),
                amount=data['amount'],
                recovery_date=datetime.strptime(data['recoveryDate'], '%Y-%m-%d').date(),
                status=data['status']
            )
            db.session.add(transaction)
            db.session.commit()
            return {'message': 'Transaction created successfully'}, 201
        except Exception as e:
            logger.error(f"Create transaction error: {str(e)}")
            db.session.rollback()
            return {'error': 'Internal Server Error'}, 500

# Register API resources
api.add_resource(UserRegistration, '/api/register')
api.add_resource(UserLogin, '/api/login')
api.add_resource(FinancialRecordResource, '/api/records')
api.add_resource(ExpenseResource, '/api/expenses')
api.add_resource(TransactionResource, '/api/transactions')

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True) 