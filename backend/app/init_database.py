"""数据库初始化脚本"""
import psycopg2
from pathlib import Path
import sys
import os

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import DB_CONFIG


def init_database():
    """初始化数据库表结构"""
    try:
        # 连接数据库
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            database=DB_CONFIG["database"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"]
        )
        cursor = conn.cursor()
        
        # 读取 SQL 脚本
        sql_file = Path(__file__).parent / "init_db.sql"
        with open(sql_file, 'r') as f:
            sql_script = f.read()
        
        # 执行 SQL 脚本
        cursor.execute(sql_script)
        conn.commit()
        
        print("✅ 数据库表结构初始化成功！")
        
        # 显示已创建的表
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print("\n📋 已创建的表：")
        for table in tables:
            print(f"  - {table[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("开始初始化数据库...")
    print(f"数据库配置: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    init_database()
