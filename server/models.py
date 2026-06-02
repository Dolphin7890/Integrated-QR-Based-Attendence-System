from app import db
from datetime import datetime

class Class(db.Model):
    __tablename__ = 'class'
    ClassID = db.Column(db.String(50), primary_key=True)
    ClassName = db.Column(db.String(100), nullable=False)
    Subject = db.Column(db.String(100))
    TeacherID = db.Column(db.String(50))

class Student(db.Model):
    __tablename__ = 'student'
    StudentID = db.Column(db.String(50), primary_key=True)
    Name = db.Column(db.String(100), nullable=False)
    Email = db.Column(db.String(100))
    QR_Code_Value = db.Column(db.String(255), unique=True)

class Book(db.Model):
    __tablename__ = 'book'
    BookID = db.Column(db.String(50), primary_key=True)
    Title = db.Column(db.String(200), nullable=False)
    Author = db.Column(db.String(100))
    ISBN = db.Column(db.String(50))
    Book_QR_Code_Value = db.Column(db.String(255), unique=True)

class ClassroomAttendance(db.Model):
    __tablename__ = 'classroom_attendance'
    AttendanceID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    StudentID = db.Column(db.String(50), db.ForeignKey('student.StudentID'), nullable=False)
    StudentName = db.Column(db.String(100)) # Added for easier DB reading
    ClassID = db.Column(db.String(50), db.ForeignKey('class.ClassID'), nullable=False)
    ClassName = db.Column(db.String(100)) # Added for easier DB reading
    DateTime_Scanned = db.Column(db.DateTime, default=datetime.utcnow)
    Status = db.Column(db.String(20)) # 'Present', etc.

class LibraryTransaction(db.Model):
    __tablename__ = 'library_transaction'
    TransactionID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    StudentID = db.Column(db.String(50), db.ForeignKey('student.StudentID'), nullable=False)
    StudentName = db.Column(db.String(100)) # Added for easier DB reading
    BookID = db.Column(db.String(50), db.ForeignKey('book.BookID'), nullable=False)
    BookTitle = db.Column(db.String(200)) # Added for easier DB reading
    Issue_DateTime = db.Column(db.DateTime, default=datetime.utcnow)
    Return_DateTime = db.Column(db.DateTime, nullable=True)
