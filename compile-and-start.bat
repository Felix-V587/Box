@echo off
echo Compiling TypeScript...
echo.

cd tv-box\backend

echo Running TypeScript compiler...
call npx tsc --noEmit

if errorlevel 1 (
    echo.
    echo ========================================
    echo Compilation FAILED! Please check errors above.
    echo ========================================
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo Compilation SUCCESSFUL!
    echo ========================================
    echo.
    echo Starting development server...
    call pnpm run start:dev
)

pause
