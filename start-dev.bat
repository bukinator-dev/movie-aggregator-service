@echo off
echo Starting Movie Aggregator Service - Backend and Frontend
echo.

REM Start backend in a new window
start "Backend Server" cmd /k "cd /d backend && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd /d frontend && npm run dev"

echo.
echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this launcher...
pause >nul
