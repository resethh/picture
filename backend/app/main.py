from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import MEDIA_DIR
from app.api import images, generate, projects, models
from app.database import init_database, close_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    init_database()
    print("[OK] PostgreSQL 数据库已连接")
    
    yield
    
    # 关闭时关闭数据库连接
    close_database()


app = FastAPI(title="AI图像生成平台", lifespan=lifespan)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# 注册路由
app.include_router(images.router, prefix="/api/images", tags=["images"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(models.router)


@app.get("/")
async def health_check():
    """健康检查"""
    return {"status": "ok"}
