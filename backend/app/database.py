import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from typing import Optional
import os


class Database:
    """数据库连接管理类（使用原始 SQL，不使用 ORM）"""
    
    def __init__(self):
        self.connection_pool: Optional[pool.SimpleConnectionPool] = None
    
    def init_pool(self, 
                  host: str,
                  port: int,
                  database: str,
                  user: str,
                  password: str,
                  min_conn: int = 1,
                  max_conn: int = 10):
        """初始化数据库连接池"""
        try:
            self.connection_pool = pool.SimpleConnectionPool(
                min_conn,
                max_conn,
                host=host,
                port=port,
                database=database,
                user=user,
                password=password
            )
            print(f"✅ 数据库连接池初始化成功: {host}:{port}/{database}")
        except Exception as e:
            print(f"❌ 数据库连接失败: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """获取数据库连接（上下文管理器）"""
        if not self.connection_pool:
            raise Exception("数据库连接池未初始化")
        
        conn = self.connection_pool.getconn()
        try:
            yield conn
        finally:
            self.connection_pool.putconn(conn)
    
    @contextmanager
    def get_cursor(self, commit: bool = True):
        """获取数据库游标（上下文管理器）"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            try:
                yield cursor
                if commit:
                    conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                cursor.close()
    
    def close_pool(self):
        """关闭数据库连接池"""
        if self.connection_pool:
            self.connection_pool.closeall()
            print("✅ 数据库连接池已关闭")


# 全局数据库实例
db = Database()


def init_database():
    """初始化数据库连接"""
    from app.config import DB_CONFIG
    
    db.init_pool(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        database=DB_CONFIG["database"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"],
        min_conn=DB_CONFIG.get("min_conn", 1),
        max_conn=DB_CONFIG.get("max_conn", 10)
    )


def close_database():
    """关闭数据库连接"""
    db.close_pool()
