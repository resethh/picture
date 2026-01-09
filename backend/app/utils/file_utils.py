from pathlib import Path
from PIL import Image
from typing import Tuple


def get_image_size(file_path: Path) -> Tuple[int, int]:
    """获取图片尺寸"""
    try:
        with Image.open(file_path) as img:
            return img.size
    except Exception:
        return (0, 0)


def validate_image_extension(filename: str, allowed_extensions: set) -> bool:
    """验证图片扩展名"""
    ext = Path(filename).suffix.lower()
    return ext in allowed_extensions
