@echo off
REM 模型管理系统快速启动脚本 (Windows)
setlocal enabledelayedexpansion

echo ================================
echo AI作图平台 - 模型管理系统启动
echo ================================
echo.

REM 检查Python
echo 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Python，请先安装Python 3.9+
    pause
    exit /b 1
)
echo ✅ Python已安装

REM 检查Node.js
echo 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到Node.js，请先安装Node.js 16+
    pause
    exit /b 1
)
echo ✅ Node.js已安装

echo.
echo ================================
echo 初始化数据库
echo ================================
echo.

REM 提示用户输入数据库信息
set DB_USER=postgres
set DB_PASSWORD=root
set DB_NAME=picture
set DB_HOST=localhost

set /p DB_USER="PostgreSQL用户名 (默认: postgres): "
set /p DB_PASSWORD="PostgreSQL密码 (默认: root): "
set /p DB_NAME="数据库名 (默认: picture): "
set /p DB_HOST="PostgreSQL主机 (默认: localhost): "

echo 正在初始化数据库...
psql -U %DB_USER% -h %DB_HOST% -d %DB_NAME% -f backend\app\migrations\add_model_management.sql

if errorlevel 1 (
    echo ⚠️  数据库初始化可能失败，请检查PostgreSQL连接信息
) else (
    echo ✅ 数据库初始化成功
)

echo.
echo ================================
echo 安装后端依赖
echo ================================
echo.

cd backend

if not exist venv (
    echo 创建虚拟环境...
    python -m venv venv
)

echo 激活虚拟环境...
call venv\Scripts\activate.bat

echo 安装Python依赖...
pip install -r requirements.txt -q

if errorlevel 1 (
    echo ❌ 后端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo ✅ 后端依赖安装成功

cd ..

echo.
echo ================================
echo 安装前端依赖
echo ================================
echo.

cd frontend
echo 安装npm依赖...
call npm install -q

if errorlevel 1 (
    echo ❌ 前端依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo ✅ 前端依赖安装成功

cd ..

echo.
echo ================================
echo 配置完成
echo ================================
echo.
echo 现在可以启动应用了！
echo.
echo 后端启动:
echo   cd backend
echo   python run.py
echo.
echo 前端启动 (新的命令窗口):
echo   cd frontend
echo   npm run dev
echo.
echo 然后访问:
echo   主页: http://localhost:5173
echo   模型管理: http://localhost:5173/models
echo   API文档: http://localhost:8000/docs
echo.

pause
