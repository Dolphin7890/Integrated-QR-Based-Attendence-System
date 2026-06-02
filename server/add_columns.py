
from app import app, db
from sqlalchemy import text

with app.app_context():
    # Use raw SQL to alter the table because SQLAlchemy doesn't support easy auto-migrations without Flask-Migrate
    try:
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE classroom_attendance ADD COLUMN StudentName VARCHAR(100)"))
            conn.execute(text("ALTER TABLE classroom_attendance ADD COLUMN ClassName VARCHAR(100)"))
            conn.commit()
        print("Successfully added columns 'StudentName' and 'ClassName' to 'classroom_attendance' table.")
    except Exception as e:
        print(f"Error (might be already exists): {e}")
