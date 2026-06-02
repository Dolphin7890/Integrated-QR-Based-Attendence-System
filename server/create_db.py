import pymysql

# Connect to MySQL Server (no database selected)
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='1234'
)

try:
    with connection.cursor() as cursor:
        cursor.execute("CREATE DATABASE IF NOT EXISTS attendance_system")
        print("Database 'attendance_system' created or already exists.")
finally:
    connection.close()
