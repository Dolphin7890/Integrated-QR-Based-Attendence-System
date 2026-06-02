# Integrated QR System - Run Commands

Open two separate PowerShell terminals.

## 1. Run Backend

```powershell
cd "C:\Users\ABC\Desktop\Integrated QR System\server"
.\venv\Scripts\python.exe app.py
```

Backend will run here:

```text
http://127.0.0.1:5000
```

Backend test URL:

```text
http://127.0.0.1:5000/api/test
```

## 2. Run Frontend

Open a new PowerShell terminal:

```powershell
cd "C:\Users\ABC\Desktop\Integrated QR System\client"
npm.cmd run dev -- --host 127.0.0.1
```

Frontend will run here:

```text
http://127.0.0.1:5173
```

## If PowerShell Blocks npm

Use this command instead of `npm run dev`:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

## Build Check

```powershell
cd "C:\Users\ABC\Desktop\Integrated QR System\client"
npm.cmd run build
```

## Lint Check

```powershell
cd "C:\Users\ABC\Desktop\Integrated QR System\client"
npm.cmd run lint
```

## Notes

- Keep both backend and frontend terminals open while using the project.
- For QR scanning, allow camera permission in the browser.
- Main app URL is `http://127.0.0.1:5173`.
