"""
模型和Provider管理服务层
"""
from typing import List, Optional, Dict, Any
from app.database import db
from app.utils.id_generator import generate_id
from datetime import datetime


class ProviderManager:
    """AI Provider管理"""
    
    @staticmethod
    def get_all_providers() -> List[Dict[str, Any]]:
        """获取所有Provider"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                "SELECT id, name, display_name, description, base_url, api_key_header, is_active "
                "FROM ai_providers WHERE is_active = true ORDER BY name"
            )
            columns = [desc[0] for desc in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    @staticmethod
    def get_provider_by_id(provider_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取Provider"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                "SELECT id, name, display_name, description, base_url, api_key_header, is_active "
                "FROM ai_providers WHERE id = %s",
                (provider_id,)
            )
            row = cursor.fetchone()
            if row:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
            return None
    
    @staticmethod
    def create_provider(name: str, display_name: str, base_url: str, 
                       description: Optional[str] = None,
                       api_key_header: str = "Authorization") -> str:
        """创建新Provider"""
        provider_id = f"provider_{generate_id()}"
        with db.get_cursor(commit=True) as cursor:
            cursor.execute(
                "INSERT INTO ai_providers (id, name, display_name, description, base_url, api_key_header) "
                "VALUES (%s, %s, %s, %s, %s, %s)",
                (provider_id, name, display_name, description, base_url, api_key_header)
            )
        return provider_id


class ModelService:
    """AI模型管理服务"""
    
    @staticmethod
    def get_all_models(active_only: bool = True) -> List[Dict[str, Any]]:
        """获取所有模型列表"""
        query = """
            SELECT m.id, m.provider_id, m.model_name, m.display_name, m.description,
                   m.model_type, m.input_params, m.output_format, m.is_active, m.sort_order,
                   p.id as provider_id, p.name as provider_name, p.display_name as provider_display_name,
                   p.base_url, p.api_key_header
            FROM models m
            JOIN ai_providers p ON m.provider_id = p.id
        """
        
        if active_only:
            query += " WHERE m.is_active = true AND p.is_active = true"
        
        query += " ORDER BY m.sort_order ASC, m.created_at DESC"
        
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    @staticmethod
    def get_model_by_id(model_id: str) -> Optional[Dict[str, Any]]:
        """根据ID获取模型详情"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                """
                SELECT m.id, m.provider_id, m.model_name, m.display_name, m.description,
                       m.model_type, m.input_params, m.output_format, m.is_active, m.sort_order,
                       p.id as provider_id, p.name as provider_name, p.display_name as provider_display_name,
                       p.base_url, p.api_key_header
                FROM models m
                JOIN ai_providers p ON m.provider_id = p.id
                WHERE m.id = %s
                """,
                (model_id,)
            )
            row = cursor.fetchone()
            if row:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
            return None
    
    @staticmethod
    def get_model_by_name(model_name: str) -> Optional[Dict[str, Any]]:
        """根据模型名称获取模型"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                """
                SELECT m.id, m.provider_id, m.model_name, m.display_name, m.description,
                       m.model_type, m.input_params, m.output_format, m.is_active, m.sort_order,
                       p.id as provider_id, p.name as provider_name, p.display_name as provider_display_name,
                       p.base_url, p.api_key_header
                FROM models m
                JOIN ai_providers p ON m.provider_id = p.id
                WHERE m.model_name = %s AND m.is_active = true
                """,
                (model_name,)
            )
            row = cursor.fetchone()
            if row:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
            return None
    
    @staticmethod
    def create_model(provider_id: str, model_name: str, display_name: str,
                    description: Optional[str] = None,
                    model_type: str = "image_generation",
                    input_params: Optional[Dict] = None,
                    output_format: str = "image",
                    sort_order: int = 0) -> str:
        """创建新模型"""
        model_id = f"model_{generate_id()}"
        import json
        
        with db.get_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO models 
                (id, provider_id, model_name, display_name, description, model_type, 
                 input_params, output_format, sort_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (model_id, provider_id, model_name, display_name, description,
                 model_type, json.dumps(input_params) if input_params else None,
                 output_format, sort_order)
            )
        return model_id
    
    @staticmethod
    def update_model(model_id: str, **updates) -> bool:
        """更新模型信息"""
        allowed_fields = ['display_name', 'description', 'is_active', 'sort_order', 'input_params']
        updates = {k: v for k, v in updates.items() if k in allowed_fields and v is not None}
        
        if not updates:
            return True
        
        import json
        if 'input_params' in updates and isinstance(updates['input_params'], dict):
            updates['input_params'] = json.dumps(updates['input_params'])
        
        set_clause = ", ".join([f"{k} = %s" for k in updates.keys()])
        values = list(updates.values()) + [model_id]
        
        with db.get_cursor(commit=True) as cursor:
            cursor.execute(
                f"UPDATE models SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                values
            )
            return cursor.rowcount > 0
    
    @staticmethod
    def delete_model(model_id: str) -> bool:
        """删除模型"""
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("DELETE FROM models WHERE id = %s", (model_id,))
            return cursor.rowcount > 0


class ModelAPIKeyManager:
    """模型API密钥管理"""
    
    @staticmethod
    def get_active_key(model_id: str) -> Optional[Dict[str, Any]]:
        """获取模型的活跃API密钥"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                """
                SELECT id, model_id, api_key, is_active, expires_at, quota_limit, quota_used
                FROM model_api_keys
                WHERE model_id = %s AND is_active = true
                AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
                LIMIT 1
                """,
                (model_id,)
            )
            row = cursor.fetchone()
            if row:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
            return None
    
    @staticmethod
    def create_api_key(model_id: str, api_key: str, 
                      expires_at: Optional[datetime] = None,
                      quota_limit: Optional[int] = None) -> str:
        """创建新API密钥"""
        key_id = f"key_{generate_id()}"
        with db.get_cursor(commit=True) as cursor:
            cursor.execute(
                """
                INSERT INTO model_api_keys (id, model_id, api_key, expires_at, quota_limit)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (key_id, model_id, api_key, expires_at, quota_limit)
            )
        return key_id
    
    @staticmethod
    def update_quota_used(key_id: str, increment: int = 1) -> bool:
        """更新配额使用量"""
        with db.get_cursor(commit=True) as cursor:
            cursor.execute(
                "UPDATE model_api_keys SET quota_used = quota_used + %s WHERE id = %s",
                (increment, key_id)
            )
            return cursor.rowcount > 0
    
    @staticmethod
    def deactivate_key(key_id: str) -> bool:
        """停用API密钥"""
        with db.get_cursor(commit=True) as cursor:
            cursor.execute(
                "UPDATE model_api_keys SET is_active = false WHERE id = %s",
                (key_id,)
            )
            return cursor.rowcount > 0


class ModelConfigManager:
    """模型配置管理"""
    
    @staticmethod
    def get_config(model_id: str, config_key: str) -> Optional[Dict[str, Any]]:
        """获取单个配置"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                "SELECT id, model_id, config_key, config_value, description FROM model_configs "
                "WHERE model_id = %s AND config_key = %s",
                (model_id, config_key)
            )
            row = cursor.fetchone()
            if row:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
            return None
    
    @staticmethod
    def get_all_configs(model_id: str) -> List[Dict[str, Any]]:
        """获取模型所有配置"""
        with db.get_cursor(commit=False) as cursor:
            cursor.execute(
                "SELECT id, model_id, config_key, config_value, description FROM model_configs "
                "WHERE model_id = %s ORDER BY config_key",
                (model_id,)
            )
            columns = [desc[0] for desc in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    @staticmethod
    def set_config(model_id: str, config_key: str, config_value: Dict[str, Any],
                  description: Optional[str] = None) -> str:
        """设置/更新配置"""
        import json
        
        # 检查是否已存在
        existing = ModelConfigManager.get_config(model_id, config_key)
        
        with db.get_cursor(commit=True) as cursor:
            if existing:
                cursor.execute(
                    "UPDATE model_configs SET config_value = %s, description = %s WHERE id = %s",
                    (json.dumps(config_value), description, existing['id'])
                )
                return existing['id']
            else:
                config_id = f"config_{generate_id()}"
                cursor.execute(
                    """
                    INSERT INTO model_configs (id, model_id, config_key, config_value, description)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (config_id, model_id, config_key, json.dumps(config_value), description)
                )
                return config_id
    
    @staticmethod
    def delete_config(config_id: str) -> bool:
        """删除配置"""
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("DELETE FROM model_configs WHERE id = %s", (config_id,))
            return cursor.rowcount > 0
