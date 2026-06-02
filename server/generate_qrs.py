import qrcode
import os

# Data from seed.py
data = {
    "Student_Alice": "QR-S001",
    "Student_Bob": "QR-S002", 
    "Book_Algorithms": "QR-B001",
    "Book_CleanCode": "QR-B002",
    "Meal_Lunch": "QR-S001" # Scanning student QR for meal
}

output_dir = "qr_codes"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for name, value in data.items():
    img = qrcode.make(value)
    img.save(f"{output_dir}/{name}.png")
    print(f"Generated {name}.png with value: {value}")
