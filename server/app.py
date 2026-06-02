from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
# REPLACE 'root' and 'password' with your actual MySQL credentials
# db_password = os.environ.get('MYSQL_PASSWORD', 'password') 
# app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://root:{db_password}@localhost/attendance_system'

# Use a placeholder for now, user needs to update this or set env var
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1234@localhost/attendance_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

from routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
