from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class AIProviderBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    base_url: str
    api_key_header: str = "Authorization"
    is_active: bool = True


class AIProviderCreate(AIProviderBase):
    pass


class AIProviderResponse(AIProviderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelBase(BaseModel):
    model_name: str
    display_name: str
    description: Optional[str] = None
    model_type: str = "image_generation"
    input_params: Optional[Dict[str, Any]] = None
    output_format: str = "image"
    is_active: bool = True
    sort_order: int = 0


class ModelCreate(ModelBase):
    provider_id: str


class ModelUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    input_params: Optional[Dict[str, Any]] = None


class ModelResponse(ModelBase):
    id: str
    provider_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelDetailResponse(ModelResponse):
    provider: AIProviderResponse
    api_keys: List['ModelAPIKeyResponse'] = []
    configs: List['ModelConfigResponse'] = []


class ModelAPIKeyBase(BaseModel):
    api_key: str
    is_active: bool = True
    expires_at: Optional[datetime] = None
    quota_limit: Optional[int] = None


class ModelAPIKeyCreate(ModelAPIKeyBase):
    model_id: str


class ModelAPIKeyResponse(ModelAPIKeyBase):
    id: str
    model_id: str
    quota_used: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelConfigBase(BaseModel):
    config_key: str
    config_value: Dict[str, Any]
    description: Optional[str] = None


class ModelConfigCreate(ModelConfigBase):
    model_id: str


class ModelConfigResponse(ModelConfigBase):
    id: str
    model_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelListResponse(BaseModel):
    id: str
    model_name: str
    display_name: str
    description: Optional[str]
    provider: AIProviderResponse
    input_params: Optional[Dict[str, Any]]
    output_format: str
    sort_order: int

    class Config:
        from_attributes = True


# 前端模型选择响应
class ModelForFrontend(BaseModel):
    id: str
    modelId: str  # 前端用camelCase
    displayName: str
    description: Optional[str]
    provider: str
    providerDisplayName: str
    inputParams: Optional[Dict[str, Any]]
    outputFormat: str


class AvailableModelsResponse(BaseModel):
    models: List[ModelForFrontend]
    total: int
