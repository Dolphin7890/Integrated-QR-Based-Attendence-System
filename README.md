# Integrated QR System

An integrated QR management system with a React + TypeScript frontend and a Python Flask backend.

## Project Structure

- `client/` - React frontend built with Vite and TypeScript.
- `server/` - Flask backend with database support and QR code generation.
- `server/requirements.txt` - Python packages required for the backend.

## Requirements

- Node.js and npm
- Python 3
- MySQL or compatible database for the backend
- Camera access in the browser for QR scanning

## Setup

### Backend

```powershell
cd "c:\Users\usman\Downloads\Integrated QR System\server"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend

```powershell
cd "c:\Users\usman\Downloads\Integrated QR System\client"
npm install
```

## Run the Application

### Start Backend

```powershell
cd "c:\Users\usman\Downloads\Integrated QR System\server"
.\venv\Scripts\python.exe app.py
```

The backend should be available at:

```text
http://127.0.0.1:5000
```

### Start Frontend

```powershell
cd "c:\Users\usman\Downloads\Integrated QR System\client"
npm.cmd run dev -- --host 127.0.0.1
```

The frontend should be available at:

```text
http://127.0.0.1:5173
```

## Useful Scripts

From `client/`:

- `npm run dev` - Start development server
- `npm run build` - Build production assets
- `npm run lint` - Run ESLint checks

## Frontend Dependencies

- React
- React DOM
- TypeScript
- Vite
- Tailwind CSS
- html5-qrcode
- react-qr-code

## Backend Dependencies

- Flask
- Flask-SQLAlchemy
- Flask-Cors
- PyMySQL
- cryptography
- qrcode[pil]
- Pillow

## Notes

- Keep both frontend and backend running in separate terminals.
- Allow camera permissions in the browser for QR scanning.
- If npm commands are blocked in PowerShell, use `npm.cmd` explicitly.
