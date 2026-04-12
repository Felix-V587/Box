@echo off
echo Starting TVBox Backend...
echo.

cd tv-box\backend

echo Checking node_modules...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting development server...
echo.

call npm run start:dev

pause
