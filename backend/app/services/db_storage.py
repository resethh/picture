"""数据库存储服务（使用原始 SQL）"""
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.database import db


def save_project_to_db(project_id: str, project_data: Dict[str, Any]) -> None:
    """保存项目到数据库"""
    sql = """
        INSERT INTO projects (id, name, graph, thumbnail, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) 
        DO UPDATE SET 
            name = EXCLUDED.name,
            graph = EXCLUDED.graph,
            thumbnail = EXCLUDED.thumbnail,
            updated_at = EXCLUDED.updated_at
    """
    
    now = datetime.utcnow()
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (
            project_id,
            project_data.get("name"),
            json.dumps(project_data.get("graph")),
            project_data.get("thumbnail"),
            now,
            now
        ))


def get_project_from_db(project_id: str) -> Optional[Dict[str, Any]]:
    """从数据库获取项目"""
    sql = """
        SELECT id, name, graph, thumbnail, created_at, updated_at
        FROM projects
        WHERE id = %s
    """
    
    with db.get_cursor(commit=False) as cursor:
        cursor.execute(sql, (project_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return {
            "id": row[0],
            "name": row[1],
            "graph": row[2],  # JSONB 自动解析
            "thumbnail": row[3],
            "createdAt": row[4].isoformat() if row[4] else None,
            "updatedAt": row[5].isoformat() if row[5] else None
        }


def get_all_projects_from_db() -> List[Dict[str, Any]]:
    """从数据库获取所有项目列表（仅私有项目）"""
    sql = """
        SELECT id, name, thumbnail, created_at, updated_at
        FROM projects
        WHERE is_public = FALSE OR is_public IS NULL
        ORDER BY updated_at DESC
    """
    
    with db.get_cursor(commit=False) as cursor:
        cursor.execute(sql)
        rows = cursor.fetchall()
        
        projects = []
        for row in rows:
            projects.append({
                "id": row[0],
                "name": row[1],
                "thumbnail": row[2],
                "createdAt": row[3].isoformat() if row[3] else None,
                "updatedAt": row[4].isoformat() if row[4] else None
            })
        
        return projects


def get_public_projects_from_db() -> List[Dict[str, Any]]:
    """从数据库获取所有公开项目列表"""
    sql = """
        SELECT id, name, thumbnail, created_at, updated_at
        FROM projects
        WHERE is_public = TRUE
        ORDER BY updated_at DESC
    """
    
    with db.get_cursor(commit=False) as cursor:
        cursor.execute(sql)
        rows = cursor.fetchall()
        
        projects = []
        for row in rows:
            projects.append({
                "id": row[0],
                "name": row[1],
                "thumbnail": row[2],
                "createdAt": row[3].isoformat() if row[3] else None,
                "updatedAt": row[4].isoformat() if row[4] else None
            })
        
        return projects


def share_project_to_public(project_id: str) -> bool:
    """分享项目到公共空间（复制一份并标记为公开）"""
    # 获取原项目
    project = get_project_from_db(project_id)
    if not project:
        return False
    
    # 生成新的公开项目 ID
    from app.utils.id_generator import generate_project_id
    new_project_id = generate_project_id()
    
    # 复制项目并标记为公开
    sql = """
        INSERT INTO projects (id, name, graph, thumbnail, is_public, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    now = datetime.utcnow()
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (
            new_project_id,
            project["name"] + " (分享)",  # 添加后缀
            json.dumps(project["graph"]),
            project.get("thumbnail"),
            True,  # 标记为公开
            now,
            now
        ))
    
    return True


def save_task_to_db(task_id: str, task_data: Dict[str, Any]) -> None:
    """保存任务到数据库"""
    sql = """
        INSERT INTO tasks (id, image_ids, mode, model_name, prompt, ratio, count, 
                          status, progress, result_images, error, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id)
        DO UPDATE SET
            status = EXCLUDED.status,
            progress = EXCLUDED.progress,
            result_images = EXCLUDED.result_images,
            error = EXCLUDED.error,
            updated_at = EXCLUDED.updated_at
    """
    
    now = datetime.utcnow()
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (
            task_id,
            task_data.get("imageIds", []),
            task_data.get("mode", "image"),
            task_data.get("modelName", ""),
            task_data.get("prompt", ""),
            task_data.get("ratio", "1:1"),
            task_data.get("count", 1),
            task_data.get("status", "pending"),
            task_data.get("progress", 0),
            json.dumps(task_data.get("resultImages", [])),
            task_data.get("error"),
            now,
            now
        ))


def get_task_from_db(task_id: str) -> Optional[Dict[str, Any]]:
    """从数据库获取任务"""
    sql = """
        SELECT id, image_ids, mode, model_name, prompt, ratio, count,
               status, progress, result_images, error, created_at, updated_at
        FROM tasks
        WHERE id = %s
    """
    
    with db.get_cursor(commit=False) as cursor:
        cursor.execute(sql, (task_id,))
        row = cursor.fetchone()
        
        if not row:
            return None
        
        return {
            "id": row[0],
            "imageIds": row[1],
            "mode": row[2],
            "modelName": row[3],
            "prompt": row[4],
            "ratio": row[5],
            "count": row[6],
            "status": row[7],
            "progress": row[8],
            "resultImages": row[9] if row[9] else [],  # JSONB 自动解析
            "error": row[10],
            "createdAt": row[11].isoformat() + "Z" if row[11] else None,
            "updatedAt": row[12].isoformat() + "Z" if row[12] else None
        }


def update_task_progress_in_db(task_id: str, progress: int) -> None:
    """更新任务进度"""
    sql = """
        UPDATE tasks
        SET progress = %s, status = 'running'
        WHERE id = %s
    """
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (progress, task_id))


def mark_task_success_in_db(task_id: str, result_images: List[Dict[str, str]]) -> None:
    """标记任务成功"""
    sql = """
        UPDATE tasks
        SET status = 'success', progress = 100, result_images = %s
        WHERE id = %s
    """
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (json.dumps(result_images), task_id))


def mark_task_failed_in_db(task_id: str, error: str) -> None:
    """标记任务失败"""
    sql = """
        UPDATE tasks
        SET status = 'failed', error = %s
        WHERE id = %s
    """
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (error, task_id))


def save_image_to_db(image_id: str, image_data: Dict[str, Any], image_bytes: Optional[bytes] = None) -> None:
    """保存图片信息到数据库（包含二进制数据）"""
    sql = """
        INSERT INTO images (id, filename, url, width, height, file_size, data, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET
            filename = EXCLUDED.filename,
            url = EXCLUDED.url,
            width = EXCLUDED.width,
            height = EXCLUDED.height,
            file_size = EXCLUDED.file_size,
            data = COALESCE(EXCLUDED.data, images.data)
    """
    
    now = datetime.utcnow()
    
    with db.get_cursor() as cursor:
        cursor.execute(sql, (
            image_id,
            image_data.get("filename"),
            image_data.get("url"),
            image_data.get("width"),
            image_data.get("height"),
            image_data.get("file_size"),
            image_bytes,
            now
        ))
