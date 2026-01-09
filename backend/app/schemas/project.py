from pydantic import BaseModel
from typing import Any, Optional


class ProjectSaveRequest(BaseModel):
    id: Optional[str] = None
    name: str
    graph: dict


class ProjectSaveResponse(BaseModel):
    projectId: str


class ProjectLoadResponse(BaseModel):
    id: str
    name: str
    createdAt: str
    updatedAt: str
    graph: dict


class ProjectListResponse(BaseModel):
    id: str
    name: str
    createdAt: str
    updatedAt: str
    thumbnail: Optional[str] = None
