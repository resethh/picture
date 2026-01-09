import time
import uuid


def generate_id(prefix: str) -> str:
    """生成唯一ID"""
    timestamp = int(time.time() * 1000)
    unique_suffix = uuid.uuid4().hex[:6]
    return f"{prefix}_{timestamp}_{unique_suffix}"


def generate_image_id() -> str:
    """生成图片ID"""
    return generate_id("img")


def generate_task_id() -> str:
    """生成任务ID"""
    return generate_id("task")


def generate_project_id() -> str:
    """生成项目ID"""
    return generate_id("p")
