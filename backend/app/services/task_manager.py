import asyncio
from typing import Dict, Any, List
from pathlib import Path
from app.services.db_storage import save_task_to_db, get_task_from_db, update_task_progress_in_db, mark_task_success_in_db, mark_task_failed_in_db
from app.services.ai_generator import generate_placeholder_image, AIImageGenerator
from app.services.model_service import ModelService, ModelAPIKeyManager
from app.utils.id_generator import generate_image_id
import io
import base64
from PIL import Image as PILImage
import aiohttp


# 内存中的任务状态
tasks_memory: Dict[str, Dict[str, Any]] = {}


def create_task(task_id: str, task_data: Dict[str, Any], tasks_dir: Path) -> None:
    """创建任务"""
    # 保存到数据库
    save_task_to_db(task_id, task_data)
    
    # 保存到内存
    tasks_memory[task_id] = task_data


def get_task_status(task_id: str, tasks_dir: Path) -> Dict[str, Any]:
    """获取任务状态"""
    # 优先从内存读取
    if task_id in tasks_memory:
        return tasks_memory[task_id]
    
    # 从数据库读取
    task = get_task_from_db(task_id)
    
    if task:
        tasks_memory[task_id] = task
        return task
    
    return None


def update_task_progress(task_id: str, progress: int, tasks_dir: Path) -> None:
    """更新任务进度"""
    if task_id in tasks_memory:
        tasks_memory[task_id]["progress"] = progress
        tasks_memory[task_id]["status"] = "running"
        
        # 更新数据库
        update_task_progress_in_db(task_id, progress)


def mark_task_success(task_id: str, result_images: List[Dict[str, str]], tasks_dir: Path) -> None:
    """标记任务成功"""
    if task_id in tasks_memory:
        tasks_memory[task_id]["status"] = "success"
        tasks_memory[task_id]["progress"] = 100
        tasks_memory[task_id]["resultImages"] = result_images
        
        # 更新数据库
        mark_task_success_in_db(task_id, result_images)


def mark_task_failed(task_id: str, error: str, tasks_dir: Path) -> None:
    """标记任务失败"""
    if task_id in tasks_memory:
        tasks_memory[task_id]["status"] = "failed"
        tasks_memory[task_id]["error"] = error
        
        # 更新数据库
        mark_task_failed_in_db(task_id, error)


async def execute_task(task_id: str, prompt: str, generated_dir: Path, tasks_dir: Path, model_name: str = None) -> None:
    """
    Executes image generation task
    Supports both real AI provider API calls and placeholder images
    """
    generator = AIImageGenerator()
    try:
        # Update task to running
        update_task_progress(task_id, 10, tasks_dir)
        
        result_images = []
        
        # Try to call real API if model name provided
        if model_name:
            model = ModelService.get_model_by_name(model_name)
            
            if model and model.get('is_active'):
                api_key = ModelAPIKeyManager.get_active_key(model['id'])
                
                if api_key:
                    update_task_progress(task_id, 30, tasks_dir)
                    
                    provider_name = model.get('provider_name', '').lower()
                    result = await generator.generate_image(
                        provider_name=provider_name,
                        model_name=model_name,
                        prompt=prompt,
                        api_key=api_key['api_key']
                    )
                    
                    update_task_progress(task_id, 70, tasks_dir)
                    
                    if result.get('success'):
                        for idx, image_data in enumerate(result.get('images', [])):
                            try:
                                image_id = generate_image_id()
                                filename = f"{image_id}.png"
                                save_path = generated_dir / filename
                                
                                if isinstance(image_data, str):
                                    if image_data.startswith('data:image'):
                                        base64_str = image_data.split(',')[1]
                                        img_data = base64.b64decode(base64_str)
                                    else:
                                        async with aiohttp.ClientSession() as session:
                                            async with session.get(image_data) as resp:
                                                img_data = await resp.read()
                                    
                                    with open(save_path, 'wb') as f:
                                        f.write(img_data)
                                
                                result_images.append({
                                    "imageId": image_id,
                                    "url": f"/media/generated/{filename}"
                                })
                            except Exception as e:
                                print(f"Save image failed: {e}")
                        
                        ModelAPIKeyManager.update_quota_used(api_key['id'])
                    else:
                        raise Exception(f"Generation failed: {result.get('error')}")
        
        # If no images generated or model not available, use placeholder
        if not result_images:
            print("Using placeholder image...")
            image_id = generate_image_id()
            filename = f"{image_id}.png"
            save_path = generated_dir / filename
            generate_placeholder_image(save_path, prompt)
            
            result_images = [{
                "imageId": image_id,
                "url": f"/media/generated/{filename}"
            }]
        
        update_task_progress(task_id, 100, tasks_dir)
        mark_task_success(task_id, result_images, tasks_dir)
        
    except Exception as e:
        print(f"Task execution failed: {e}")
        mark_task_failed(task_id, str(e), tasks_dir)
    finally:
        await generator.close()
