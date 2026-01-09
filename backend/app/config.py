from pathlib import Path
import os

# 基础路径
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MEDIA_DIR = BASE_DIR / "media"
UPLOAD_DIR = MEDIA_DIR / "uploads"
GENERATED_DIR = MEDIA_DIR / "generated"
PROJECTS_DIR = DATA_DIR / "projects"
TASKS_DIR = DATA_DIR / "tasks"

# 创建必要目录
for directory in [UPLOAD_DIR, GENERATED_DIR, PROJECTS_DIR, TASKS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# 支持的图片格式
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# 最大上传大小（10MB）
MAX_UPLOAD_SIZE = 10 * 1024 * 1024




# 服务器配置
HOST = "0.0.0.0"
PORT = 8000

# 数据库配置
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "picture"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "root"),
    "min_conn": int(os.getenv("DB_MIN_CONN", "1")),
    "max_conn": int(os.getenv("DB_MAX_CONN", "10"))
}