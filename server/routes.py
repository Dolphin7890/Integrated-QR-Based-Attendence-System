from flask import request, jsonify, send_file
from app import app, db
from models import Student, Class, Book, ClassroomAttendance, LibraryTransaction
from datetime import datetime, date
import qrcode
import io
import zipfile

def normalize_qr_value(value):
    if value is None:
        return ''
    return str(value).strip()

def qr_lookup_candidates(value):
    normalized = normalize_qr_value(value)
    if not normalized:
        return []

    candidates = {normalized}
    if normalized.upper().startswith('QR-'):
        candidates.add(normalized[3:])
    else:
        candidates.add(f"QR-{normalized}")
    return list(candidates)

def find_student_by_qr(value):
    candidates = qr_lookup_candidates(value)
    if not candidates:
        return None

    student = Student.query.filter(Student.QR_Code_Value.in_(candidates)).first()
    if student:
        return student

    student_ids = [candidate[3:] if candidate.upper().startswith('QR-') else candidate for candidate in candidates]
    return Student.query.filter(Student.StudentID.in_(student_ids)).first()

def find_book_by_qr(value):
    candidates = qr_lookup_candidates(value)
    if not candidates:
        return None

    book = Book.query.filter(Book.Book_QR_Code_Value.in_(candidates)).first()
    if book:
        return book

    book_ids = [candidate[3:] if candidate.upper().startswith('QR-') else candidate for candidate in candidates]
    return Book.query.filter(Book.BookID.in_(book_ids)).first()

@app.route('/', methods=['GET'])
def home():
    return "<h1>Integrated QR Based Attendance System - Backend 🚀</h1><p>Frontend is at <a href='http://localhost:5173'>http://localhost:5173</a></p>"

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Server is running"})

# --- Students ---
@app.route('/api/classes', methods=['GET'])
def get_classes():
    classes = Class.query.all()
    return jsonify([{"ClassID": c.ClassID, "ClassName": c.ClassName, "Subject": c.Subject, "TeacherID": c.TeacherID} for c in classes])

@app.route('/api/classes', methods=['POST'])
def create_class():
    data = request.json
    class_name = data.get('className')
    subject = data.get('subject')
    teacher_id = data.get('teacherId')

    if not class_name:
        return jsonify({"error": "Class Name is required"}), 400

    import uuid
    class_id = f"C-{uuid.uuid4().hex[:6].upper()}"
    
    new_class = Class(
        ClassID=class_id,
        ClassName=class_name,
        Subject=subject,
        TeacherID=teacher_id
    )
    
    try:
        db.session.add(new_class)
        db.session.commit()
        return jsonify({
            "message": "Class created successfully",
            "class": {
                "ClassID": class_id,
                "ClassName": class_name,
                "Subject": subject,
                "TeacherID": teacher_id
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/students', methods=['GET'])

def get_students():
    students = Student.query.all()
    return jsonify([{"StudentID": s.StudentID, "Name": s.Name, "Email": s.Email, "QR_Code_Value": s.QR_Code_Value} for s in students])

@app.route('/api/students/download_all', methods=['GET'])
def download_all_students_qr():
    students = Student.query.all()
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for student in students:
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(student.QR_Code_Value)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            img_buffer = io.BytesIO()
            img.save(img_buffer, format="PNG")
            img_buffer.seek(0)
            
            # Filename: Name_ID.png (Cleaned)
            safe_name = "".join([c for c in student.Name if c.isalnum() or c in (' ', '_')]).strip()
            filename = f"{safe_name}_{student.StudentID}.png"
            zip_file.writestr(filename, img_buffer.getvalue())
            
    zip_buffer.seek(0)
    return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='students_qrs.zip')

@app.route('/api/books/download_all', methods=['GET'])
def download_all_books_qr():
    books = Book.query.all()
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for book in books:
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(book.Book_QR_Code_Value)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            img_buffer = io.BytesIO()
            img.save(img_buffer, format="PNG")
            img_buffer.seek(0)
            
            safe_title = "".join([c for c in book.Title if c.isalnum() or c in (' ', '_')]).strip()
            filename = f"{safe_title}_{book.BookID}.png"
            zip_file.writestr(filename, img_buffer.getvalue())
            
    zip_buffer.seek(0)
    return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name='books_qrs.zip')
@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    
    if not name:
        return jsonify({"error": "Name is required"}), 400

    # Generate unique ID and QR if not provided
    import uuid
    student_id = f"S-{uuid.uuid4().hex[:6].upper()}"
    qr_value = f"QR-{student_id}"

    new_student = Student(
        StudentID=student_id,
        Name=name,
        Email=email,
        QR_Code_Value=qr_value
    )
    
    try:
        db.session.add(new_student)
        db.session.commit()
        return jsonify({
            "message": "Student created successfully",
            "student": {
                "StudentID": student_id,
                "Name": name,
                "Email": email,
                "QR_Code_Value": qr_value
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/qrs/download', methods=['GET'])
def download_all_qrs():
    students = Student.query.all()
    
    # Create a zip file in memory
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for student in students:
            # Generate QR
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(student.QR_Code_Value)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save QR to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            # Add to zip
            filename = f"{student.Name}_{student.StudentID}.png"
            zf.writestr(filename, img_byte_arr.getvalue())
    
    memory_file.seek(0)
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name='student_qr_codes.zip'
    )

# --- Books ---
@app.route('/api/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{"BookID": b.BookID, "Title": b.Title, "Author": b.Author, "Book_QR_Code_Value": b.Book_QR_Code_Value} for b in books])

@app.route('/api/books', methods=['POST'])
def create_book():
    data = request.json
    title = data.get('title')
    author = data.get('author')
    
    if not title:
        return jsonify({"error": "Title is required"}), 400

    # Generate unique QR if not provided
    import uuid
    # Use B-{UUID} for Book ID
    book_id = f"B-{uuid.uuid4().hex[:6].upper()}" 
    qr_value = f"QR-{book_id}"

    new_book = Book(
        BookID=book_id,
        Title=title,
        Author=author,
        Book_QR_Code_Value=qr_value
    )
    
    try:
        db.session.add(new_book)
        db.session.commit()
        return jsonify({
            "message": "Book created successfully",
            "book": {
                "BookID": book_id,
                "Title": title,
                "Author": author,
                "Book_QR_Code_Value": qr_value
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/qrs/download', methods=['GET'])
def download_all_book_qrs():
    books = Book.query.all()
    
    # Create a zip file in memory
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for book in books:
            # Generate QR
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(book.Book_QR_Code_Value)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save QR to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            # Add to zip
            # Sanitizing filename
            safe_title = "".join([c for c in book.Title if c.isalnum() or c in (' ', '-', '_')]).strip()
            filename = f"{book.BookID}_{safe_title}.png"
            zf.writestr(filename, img_byte_arr.getvalue())
    
    memory_file.seek(0)
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name='book_qr_codes.zip'
    )

# --- Attendance ---
@app.route('/api/attendance/mark', methods=['POST'])
def mark_attendance():
    data = request.json
    student_qr = data.get('student_qr')
    class_id = data.get('class_id') # Assumed to be selected or fixed for the session

    if not normalize_qr_value(student_qr):
        return jsonify({"error": "Student QR is required"}), 400

    if not normalize_qr_value(class_id):
        return jsonify({"error": "Class is required"}), 400

    student = find_student_by_qr(student_qr)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    # Fetch Class Name
    class_obj = Class.query.filter_by(ClassID=class_id).first()
    if not class_obj:
        return jsonify({"error": "Class not found"}), 404
    class_name = class_obj.ClassName

    # Check if already marked for today
    today = datetime.now().date()
    existing = ClassroomAttendance.query.filter(
        ClassroomAttendance.StudentID == student.StudentID,
        ClassroomAttendance.ClassID == class_id,
        db.func.date(ClassroomAttendance.DateTime_Scanned) == today
    ).first()
    
    if existing:
        return jsonify({"error": "Attendance already marked for this class today"}), 400

    attendance = ClassroomAttendance(
        StudentID=student.StudentID,
        StudentName=student.Name,
        ClassID=class_id,
        ClassName=class_name,
        Status='Present',
        DateTime_Scanned=datetime.now()
    )
    db.session.add(attendance)
    db.session.commit()
    
    return jsonify({
        "message": "Attendance marked",
        "student": {"name": student.Name, "id": student.StudentID}
    })

@app.route('/api/history/attendance', methods=['GET'])
def get_attendance_history():
    # Filter by TODAY
    today = datetime.now().date()
    records = ClassroomAttendance.query.filter(
        db.func.date(ClassroomAttendance.DateTime_Scanned) == today
    ).order_by(ClassroomAttendance.DateTime_Scanned.desc()).all()
    
    result = []
    for r in records:
        st = Student.query.get(r.StudentID)
        result.append({
            "id": r.AttendanceID,
            "student_name": st.Name if st else "Unknown",
            "class_name": r.ClassName if r.ClassName else "Unknown Class",
            "class_id": r.ClassID,
            "time": r.DateTime_Scanned.strftime("%H:%M:%S"), # Show only time for daily view
            "status": r.Status
        })
    return jsonify(result)

@app.route('/api/attendance/download/<class_id>', methods=['GET'])
def download_class_attendance(class_id):
    today = datetime.now().date()
    
    # Fetch records for this class today
    records = ClassroomAttendance.query.filter(
        ClassroomAttendance.ClassID == class_id,
        db.func.date(ClassroomAttendance.DateTime_Scanned) == today
    ).all()
    
    # Fetch Class Name for filename
    class_obj = Class.query.filter_by(ClassID=class_id).first()
    class_name = class_obj.ClassName if class_obj else "Unknown_Class"
    safe_classname = "".join([c for c in class_name if c.isalnum() or c in (' ', '_')]).strip()

    # Generate CSV in memory
    output = io.StringIO()
    output.write("Student Name,Student ID,Time,Status\n")
    
    for r in records:
        st = Student.query.get(r.StudentID)
        st_name = st.Name if st else "Unknown"
        time_str = r.DateTime_Scanned.strftime("%H:%M:%S")
        output.write(f"{st_name},{r.StudentID},{time_str},{r.Status}\n")
    
    # Convert string buffer to bytes
    mem = io.BytesIO()
    mem.write(output.getvalue().encode('utf-8'))
    mem.seek(0)
    output.close()
    
    filename = f"Attendance_{safe_classname}_{today}.csv"
    
    return send_file(
        mem,
        mimetype='text/csv',
        as_attachment=True,
        download_name=filename
    )

# --- Library ---
@app.route('/api/library/issue', methods=['POST'])
def issue_book():
    data = request.json
    student_qr = data.get('student_qr')
    book_qr = data.get('book_qr')

    if not normalize_qr_value(student_qr):
        return jsonify({"error": "Student QR is required"}), 400

    if not normalize_qr_value(book_qr):
        return jsonify({"error": "Book QR is required"}), 400

    student = find_student_by_qr(student_qr)
    book = find_book_by_qr(book_qr)

    if not student or not book:
        return jsonify({"error": "Student or Book not found"}), 404

    transaction = LibraryTransaction(
        StudentID=student.StudentID,
        StudentName=student.Name,
        BookID=book.BookID,
        BookTitle=book.Title,
        Issue_DateTime=datetime.now()
    )
    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Book issued", "book": book.Title, "student": student.Name})

@app.route('/api/library/return', methods=['POST'])
def return_book():
    data = request.json
    book_qr = data.get('book_qr')
    
    if not normalize_qr_value(book_qr):
        return jsonify({"error": "Book QR is required"}), 400

    book = find_book_by_qr(book_qr)
    if not book:
         return jsonify({"error": "Book not found"}), 404

    # Find open transaction
    transaction = LibraryTransaction.query.filter_by(BookID=book.BookID, Return_DateTime=None).first()
    if not transaction:
        return jsonify({"error": "No active issue record found for this book"}), 400
    
    transaction.Return_DateTime = datetime.now()
    db.session.commit()
    
    return jsonify({"message": "Book returned", "book": book.Title})

@app.route('/api/library/daily', methods=['GET'])
def get_library_daily():
    # Show transactions that happened TODAY (Issue OR Return)
    today = datetime.now().date()
    transactions = LibraryTransaction.query.filter(
        (db.func.date(LibraryTransaction.Issue_DateTime) == today) | 
        (db.func.date(LibraryTransaction.Return_DateTime) == today)
    ).order_by(LibraryTransaction.Issue_DateTime.desc()).all()
    
    result = []
    for t in transactions:
        st = Student.query.get(t.StudentID)
        bk = Book.query.get(t.BookID)
        result.append({
            "id": t.TransactionID,
            "student_name": t.StudentName if t.StudentName else (st.Name if st else "Unknown"),
            "book_title": t.BookTitle if t.BookTitle else (bk.Title if bk else "Unknown"),
            "issue_date": t.Issue_DateTime.strftime("%Y-%m-%d %H:%M:%S"),
            "return_date": t.Return_DateTime.strftime("%Y-%m-%d %H:%M:%S") if t.Return_DateTime else "Not Returned",
            "type": "Returned" if (t.Return_DateTime and t.Return_DateTime.date() == today) else "Issued"
        })
    return jsonify(result)

@app.route('/api/history/library', methods=['GET'])
def get_library_history():
    # Get last 50 transactions (Recent History)
    transactions = LibraryTransaction.query.order_by(LibraryTransaction.Issue_DateTime.desc()).limit(50).all()
    result = []
    for t in transactions:
        st = Student.query.get(t.StudentID)
        bk = Book.query.get(t.BookID)
        result.append({
            "id": t.TransactionID,
            "student_name": t.StudentName if t.StudentName else (st.Name if st else "Unknown"),
            "book_title": t.BookTitle if t.BookTitle else (bk.Title if bk else "Unknown"),
            "issue_date": t.Issue_DateTime.strftime("%Y-%m-%d %H:%M:%S"),
            "return_date": t.Return_DateTime.strftime("%Y-%m-%d %H:%M:%S") if t.Return_DateTime else "Not Returned"
        })
    return jsonify(result)

