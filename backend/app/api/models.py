"""
模型管理API接口
"""
from fastapi import APIRouter, HTTPException, Query
from app.schemas.model import (
    ModelResponse, ModelListResponse, ModelForFrontend, 
    AvailableModelsResponse, ModelDetailResponse,
    ModelAPIKeyCreate, ModelAPIKeyResponse,
    ModelConfigCreate, ModelConfigResponse
)
from app.services.model_service import (
    ModelService, ProviderManager, ModelAPIKeyManager, ModelConfigManager
)
from typing import List, Optional

router = APIRouter(prefix="/api/models", tags=["models"])


# =============== 模型列表和查询接口 ===============

@router.get("", response_model=AvailableModelsResponse)
async def get_available_models():
    """获取所有可用的AI模型列表（前端用）"""
    models = ModelService.get_all_models(active_only=True)
    
    result_models = []
    for model in models:
        result_models.append(ModelForFrontend(
            id=model['id'],
            modelId=model['model_name'],  # 前端识别模型的key
            displayName=model['display_name'],
            description=model['description'],
            provider=model['provider_name'],
            providerDisplayName=model['provider_display_name'],
            inputParams=model.get('input_params'),
            outputFormat=model.get('output_format', 'image')
        ))
    
    return AvailableModelsResponse(
        models=result_models,
        total=len(result_models)
    )


@router.get("/list", response_model=List[ModelListResponse])
async def list_all_models(active_only: bool = Query(True)):
    """获取模型详细列表（管理后台用）"""
    models = ModelService.get_all_models(active_only=active_only)
    
    # 这里需要转换为ResponseModel
    # 由于数据库查询已包含provider信息，需要手动构建响应
    result = []
    for model in models:
        result.append({
            'id': model['id'],
            'model_name': model['model_name'],
            'display_name': model['display_name'],
            'description': model['description'],
            'provider': {
                'id': model['provider_id'],
                'name': model['provider_name'],
                'display_name': model['provider_display_name'],
                'base_url': model['base_url'],
                'api_key_header': model['api_key_header'],
                'is_active': True,
                'created_at': None,
                'updated_at': None,
                'description': None
            },
            'input_params': model.get('input_params'),
            'output_format': model.get('output_format', 'image'),
            'sort_order': model.get('sort_order', 0)
        })
    
    return result


@router.get("/providers")
async def get_providers():
    """获取所有AI供应商"""
    providers = ProviderManager.get_all_providers()
    return {
        'providers': providers,
        'total': len(providers)
    }


@router.get("/{model_id}")
async def get_model_detail(model_id: str):
    """获取模型详情"""
    model = ModelService.get_model_by_id(model_id)
    
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    
    # 获取API密钥和配置
    api_keys = []
    configs = []
    
    try:
        configs = ModelConfigManager.get_all_configs(model_id)
    except:
        pass
    
    return {
        'id': model['id'],
        'model_name': model['model_name'],
        'display_name': model['display_name'],
        'description': model['description'],
        'model_type': model.get('model_type'),
        'input_params': model.get('input_params'),
        'output_format': model.get('output_format'),
        'is_active': model.get('is_active'),
        'sort_order': model.get('sort_order'),
        'provider_id': model['provider_id'],
        'provider': {
            'id': model['provider_id'],
            'name': model['provider_name'],
            'display_name': model['provider_display_name'],
            'base_url': model['base_url'],
            'api_key_header': model['api_key_header']
        },
        'api_keys': api_keys,
        'configs': configs
    }


# =============== 模型的API密钥管理 ===============

@router.post("/{model_id}/api-keys", response_model=ModelAPIKeyResponse)
async def create_model_api_key(model_id: str, request: ModelAPIKeyCreate):
    """为模型添加新的API密钥"""
    # 验证模型存在
    model = ModelService.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    
    key_id = ModelAPIKeyManager.create_api_key(
        model_id=model_id,
        api_key=request.api_key,
        expires_at=request.expires_at,
        quota_limit=request.quota_limit
    )
    
    return {
        'id': key_id,
        'model_id': model_id,
        'api_key': request.api_key,
        'is_active': request.is_active,
        'expires_at': request.expires_at,
        'quota_limit': request.quota_limit,
        'quota_used': 0,
        'created_at': None,
        'updated_at': None
    }


@router.get("/{model_id}/api-keys")
async def get_model_api_keys(model_id: str):
    """获取模型的所有API密钥"""
    model = ModelService.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    
    # 这里应该从数据库查询，暂时返回示例
    return {
        'model_id': model_id,
        'api_keys': []
    }


# =============== 模型配置管理 ===============

@router.post("/{model_id}/configs", response_model=ModelConfigResponse)
async def set_model_config(model_id: str, request: ModelConfigCreate):
    """设置模型配置（如费用、参数限制等）"""
    # 验证模型存在
    model = ModelService.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    
    config_id = ModelConfigManager.set_config(
        model_id=model_id,
        config_key=request.config_key,
        config_value=request.config_value,
        description=request.description
    )
    
    return {
        'id': config_id,
        'model_id': model_id,
        'config_key': request.config_key,
        'config_value': request.config_value,
        'description': request.description,
        'created_at': None,
        'updated_at': None
    }


@router.get("/{model_id}/configs/{config_key}")
async def get_model_config(model_id: str, config_key: str):
    """获取单个模型配置"""
    config = ModelConfigManager.get_config(model_id, config_key)
    
    if not config:
        raise HTTPException(status_code=404, detail="配置不存在")
    
    return config


@router.get("/{model_id}/configs")
async def list_model_configs(model_id: str):
    """获取模型所有配置"""
    model = ModelService.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型不存在")
    
    configs = ModelConfigManager.get_all_configs(model_id)
    return {
        'model_id': model_id,
        'configs': configs
    }


# =============== 供应商管理 ===============

