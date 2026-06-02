
from app import app, db
from models import ClassroomAttendance, Student, Class

with app.app_context():
    # Find all records where StudentName or ClassName is NULL
    records = ClassroomAttendance.query.filter(
        (ClassroomAttendance.StudentName == None) | 
        (ClassroomAttendance.ClassName == None)
    ).all()
    
    print(f"Found {len(records)} records to backfill...")
    
    count = 0
    for record in records:
        # Update Student Name
        if not record.StudentName:
            student = Student.query.get(record.StudentID)
            if student:
                record.StudentName = student.Name
        
        # Update Class Name
        if not record.ClassName:
            # Handle case where ClassID might be missing or old format
            if record.ClassID:
                class_obj = Class.query.get(record.ClassID)
                if class_obj:
                    record.ClassName = class_obj.ClassName
                else:
                    # Fallback for manually inserted or old test data without valid Class link
                    record.ClassName = "Unknown Class (Legacy)"
        
        count += 1
    
    try:
        db.session.commit()
        print(f"Successfully updated {count} records with names.")
    except Exception as e:
        db.session.rollback()
        print(f"Error updating records: {e}")
