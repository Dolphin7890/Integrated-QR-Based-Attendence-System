from app import app, db
from models import Student, Class, Book

def seed():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Classes
        c1 = Class(ClassID='C101', ClassName='Computer Science A', Subject='CS', TeacherID='T001')
        c2 = Class(ClassID='C102', ClassName='Mathematics B', Subject='Math', TeacherID='T002')
        
        # Students
        s1 = Student(StudentID='S001', Name='Alice Smith', Email='alice@example.com', QR_Code_Value='QR-S001')
        s2 = Student(StudentID='S002', Name='Bob Jones', Email='bob@example.com', QR_Code_Value='QR-S002')
        
        # Books
        b1 = Book(BookID='B001', Title='Introduction to Algorithms', Author='Cormen', ISBN='9780262033848', Book_QR_Code_Value='QR-B001')
        b2 = Book(BookID='B002', Title='Clean Code', Author='Robert Martin', ISBN='9780132350884', Book_QR_Code_Value='QR-B002')

        db.session.add_all([c1, c2, s1, s2, b1, b2])
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed()
