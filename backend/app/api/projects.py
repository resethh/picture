from fastapi import APIRouter, HTTPException
from app.schemas.project import ProjectSaveRequest, ProjectSaveResponse, ProjectLoadResponse, ProjectListResponse
from app.utils.id_generator import generate_project_id
from app.services.db_storage import (
    save_project_to_db, 
    get_project_from_db, 
    get_all_projects_from_db,
    get_public_projects_from_db,
    share_project_to_public
)
from typing import List

router = APIRouter()


@router.get("/public", response_model=List[ProjectListResponse])
async def list_public_projects_api():
    """获取所有公开项目列表（优秀案例）"""
    projects = get_public_projects_from_db()
    return projects


@router.get("", response_model=List[ProjectListResponse])
async def list_projects_api():
    """获取所有项目列表"""
    projects = get_all_projects_from_db()
    return projects


@router.post("", response_model=ProjectSaveResponse)
async def save_project_api(request: ProjectSaveRequest):
    """保存项目"""
    # 如果有 ID，就使用现有 ID（更新）；否则生成新 ID
    project_id = request.id if request.id else generate_project_id()
    
    # 项目数据
    project_data = {
        "name": request.name,
        "graph": request.graph
    }
    
    # 保存项目到数据库
    save_project_to_db(project_id, project_data)
    
    return ProjectSaveResponse(projectId=project_id)


@router.post("/{project_id}/share")
async def share_project_api(project_id: str):
    """分享项目到公共空间（复制一份到公开区）"""
    result = share_project_to_public(project_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    return {"success": True, "message": "分享成功"}


@router.get("/{project_id}", response_model=ProjectLoadResponse)
async def load_project_api(project_id: str):
    """加载项目"""
    project = get_project_from_db(project_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    return ProjectLoadResponse(
        id=project["id"],
        name=project["name"],
        createdAt=project["createdAt"],
        updatedAt=project["updatedAt"],
        graph=project["graph"]
    )
