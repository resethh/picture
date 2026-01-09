import psycopg2
import sys
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import DB_CONFIG

def test_connection():
    """测试 PostgreSQL 连接"""
    
    try:
        print("正在测试 PostgreSQL 连接...")
        print(f"配置: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
        print(f"用户: {DB_CONFIG['user']}")
        
        conn = psycopg2.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            database=DB_CONFIG["database"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            client_encoding='UTF8'
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print("\n✅ 连接成功！")
        print(f"PostgreSQL 版本: {version[0]}")
        
        # 查看已有的表
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        if tables:
            print("\n📋 已有的表:")
            for table in tables:
                print(f"  - {table[0]}")
        else:
            print("\n📋 数据库中还没有表")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ 连接失败: {e}")
        print("\n请检查:")
        print("1. PostgreSQL 服务是否启动")
        print("2. 数据库 'picturev1' 是否已创建")
        print("3. 用户名和密码是否正确")
        print("4. 端口号是否正确")
        return False
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_connection()