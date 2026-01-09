"""
应用数据库迁移脚本
添加 is_public 字段到 projects 表
"""
import os
import sys

# 添加项目根目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import db
from app.config import DB_CONFIG

def run_migration():
    """运行数据库迁移"""
    migration_file = os.path.join(
        os.path.dirname(__file__), 
        'migrations', 
        'add_is_public_field.sql'
    )
    
    print("正在应用数据库迁移...")
    
    try:
        # 初始化数据库连接
        print("正在连接数据库...")
        db.init_pool(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            database=DB_CONFIG["database"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            min_conn=DB_CONFIG["min_conn"],
            max_conn=DB_CONFIG["max_conn"]
        )
        print("✓ 数据库连接成功")
        
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        print("正在执行 SQL 迁移...")
        with db.get_cursor() as cursor:
            # 执行迁移 SQL
            cursor.execute(sql)
        
        print("✓ 数据库迁移成功完成")
        print("✓ 已添加 is_public 字段到 projects 表")
        print("✓ 已创建相关索引")
        
    except Exception as e:
        print(f"✗ 数据库迁移失败: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        # 关闭数据库连接
        db.close_pool()

if __name__ == "__main__":
    run_migration()
