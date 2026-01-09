from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class GenerateParams(BaseModel):
    ratio: str = "1:1"
    count: int = 1


class GenerateRequest(BaseModel):
    imageIds: List[str]
    mode: str = "image"
    modelName: str
    prompt: str
    params: GenerateParams


class GenerateResponse(BaseModel):
    taskId: str


class ResultImage(BaseModel):
    imageId: str
    url: str


class TaskStatusResponse(BaseModel):
    taskId: str
    status: str
    progress: int
    resultImages: List[ResultImage]
    error: Optional[str] = None
