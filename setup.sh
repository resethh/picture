#!/bin/bash
# 模型管理系统快速启动脚本

echo "================================"
echo "AI作图平台 - 模型管理系统启动"
echo "================================"
echo ""

# 检查Python
echo "检查Python环境..."
if ! command -v python &> /dev/null; then
    echo "❌ 未找到Python，请先安装Python 3.9+"
    exit 1
fi
echo "✅ Python已安装"

# 检查PostgreSQL
echo "检查PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL命令行工具未找到，请确保PostgreSQL已安装"
else
    echo "✅ PostgreSQL已安装"
fi

# 检查Node.js
echo "检查Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi
echo "✅ Node.js已安装"

echo ""
echo "================================"
echo "初始化数据库"
echo "================================"
echo ""

# 提示用户输入数据库信息
read -p "PostgreSQL用户名 (默认: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "PostgreSQL密码 (默认: root): " DB_PASSWORD
DB_PASSWORD=${DB_PASSWORD:-root}

read -p "数据库名 (默认: picture): " DB_NAME
DB_NAME=${DB_NAME:-picture}

read -p "PostgreSQL主机 (默认: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

# 执行数据库初始化
echo "正在初始化数据库..."
export PGPASSWORD=$DB_PASSWORD
psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f backend/app/migrations/add_model_management.sql 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ 数据库初始化成功"
else
    echo "⚠️  数据库初始化可能失败，请检查PostgreSQL连接信息"
fi

echo ""
echo "================================"
echo "安装后端依赖"
echo "================================"
echo ""

cd backend
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python -m venv venv
fi

echo "激活虚拟环境..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null

echo "安装Python依赖..."
pip install -r requirements.txt -q

if [ $? -eq 0 ]; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi

cd ..

echo ""
echo "================================"
echo "安装前端依赖"
echo "================================"
echo ""

cd frontend
echo "安装npm依赖..."
npm install -q

if [ $? -eq 0 ]; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi

cd ..

echo ""
echo "================================"
echo "配置完成"
echo "================================"
echo ""
echo "现在可以启动应用了！"
echo ""
echo "后端启动:"
echo "  cd backend"
echo "  python run.py"
echo ""
echo "前端启动 (新的终端):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "然后访问:"
echo "  主页: http://localhost:5173"
echo "  模型管理: http://localhost:5173/models"
echo "  API文档: http://localhost:8000/docs"
echo ""
