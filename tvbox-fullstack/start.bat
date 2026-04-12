@echo off
echo ========================================
echo TVBox 全栈应用启动脚本
echo ========================================
echo.

echo [1/4] 安装后端依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo 后端依赖安装失败！
    pause
    exit /b 1
)

echo.
echo [2/4] 安装前端依赖...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo 前端依赖安装失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 启动后端服务...
cd ..\backend
start cmd /k "npm run start:dev"

echo.
echo [4/4] 启动前端服务...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ========================================
echo 启动完成！
echo 后端服务: http://localhost:3000
echo 前端服务: http://localhost:5173
echo ========================================
echo.
echo 请在浏览器中访问: http://localhost:5173
echo.
pause
