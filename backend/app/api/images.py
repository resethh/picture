from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil

from app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS, MAX_UPLOAD_SIZE
from app.schemas.image import ImageUploadResponse
from app.utils.id_generator import generate_image_id
from app.utils.file_utils import get_image_size, validate_image_extension
from app.services.db_storage import save_image_to_db

router = APIRouter()


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """上传图片"""
    # 验证文件扩展名
    if not validate_image_extension(file.filename, ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"文件格式不支持，仅支持 {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # 生成唯一文件名
    image_id = generate_image_id()
    suffix = Path(file.filename).suffix.lower()
    filename = f"{image_id}{suffix}"
    save_path = UPLOAD_DIR / filename
    
    # 保存文件到磁盘
    try:
        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")
    
    # 获取图片尺寸
    width, height = get_image_size(save_path)
    # 获取文件大小
    file_size = save_path.stat().st_size

    # 读取文件二进制内容
    with save_path.open("rb") as f:
        image_bytes = f.read()
    
    # 保存图片元数据和二进制到数据库
    save_image_to_db(
        image_id,
        {
            "filename": filename,
            "url": f"/media/uploads/{filename}",
            "width": width,
            "height": height,
            "file_size": file_size,
        },
        image_bytes,
    )
    
    return ImageUploadResponse(
        imageId=image_id,
        url=f"/media/uploads/{filename}",
        width=width,
        height=height
    )
