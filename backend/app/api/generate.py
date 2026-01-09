from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.generate import GenerateRequest, GenerateResponse, TaskStatusResponse
from app.config import GENERATED_DIR, TASKS_DIR
from app.utils.id_generator import generate_task_id
from app.services.task_manager import create_task, get_task_status, execute_task

router = APIRouter()


@router.post("", response_model=GenerateResponse)
async def create_generate_task(
    request: GenerateRequest,
    background_tasks: BackgroundTasks
):
    """创建生成任务"""
    # 生成任务ID
    task_id = generate_task_id()
    
    # 创建任务数据
    task_data = {
        "id": task_id,
        "status": "pending",
        "progress": 0,
        "mode": request.mode,
        "modelName": request.modelName,
        "prompt": request.prompt,
        "imageIds": request.imageIds,
        "params": request.params.dict(),
        "resultImages": [],
        "error": None
    }
    
    # 保存任务
    create_task(task_id, task_data, TASKS_DIR)
    
    # 添加后台任务
    background_tasks.add_task(
        execute_task,
        task_id,
        request.prompt,
        GENERATED_DIR,
        TASKS_DIR,
        request.modelName
    )
    
    return GenerateResponse(taskId=task_id)


@router.get("/{task_id}", response_model=TaskStatusResponse)
async def get_task_status_api(task_id: str):
    """查询任务状态"""
    task = get_task_status(task_id, TASKS_DIR)
    
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    return TaskStatusResponse(
        taskId=task["id"],
        status=task["status"],
        progress=task["progress"],
        resultImages=task.get("resultImages", []),
        error=task.get("error")
    )
