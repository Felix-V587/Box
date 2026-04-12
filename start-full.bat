@echo off
echo Starting TVBox Full Stack...
echo.

echo Starting Backend...
start "TVBox Backend" cmd /k "cd tv-box\backend && pnpm run start:dev"

timeout /t 5 /nobreak >nul

echo Starting Frontend...
start "TVBox Frontend" cmd /k "cd tv-box\frontend && pnpm run dev"

echo.
echo ========================================
echo TVBox is starting...
echo Backend: http://localhost:3000
echo Backend API Docs: http://localhost:3000/api-docs
echo Frontend: http://localhost:5173
echo ========================================
echo.

pause
