from app import app, db
from sqlalchemy import text

with app.app_context():
    try:
        # Check if columns exist, if not add them
        # Note: This is a robust way to add columns using raw SQL since SQLAlchemy doesn't auto-migrate
        print("Attempting to update library_transaction table...")
        
        with db.engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE library_transaction ADD COLUMN StudentName VARCHAR(100)"))
                print("Added StudentName column.")
            except Exception as e:
                print(f"StudentName might already exist: {e}")

            try:
                conn.execute(text("ALTER TABLE library_transaction ADD COLUMN BookTitle VARCHAR(200)"))
                print("Added BookTitle column.")
            except Exception as e:
                print(f"BookTitle might already exist: {e}")
            
            conn.commit()
            print("Schema update completed.")
            
    except Exception as e:
        print(f"Error during schema update: {e}")
