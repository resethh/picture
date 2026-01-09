# 模型和API接口管理系统实现文档

## 概述

本文档描述了AI作图平台中的模型和API接口管理系统的完整实现，包括后端数据库设计、服务层、API接口，以及前端的模型选择、动态加载和配置展示等功能。

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端应用                               │
│  ┌─────────────────┬──────────────────┬─────────────────┐   │
│  │   BottomPanel   │ generationStore  │ ModelConfigPanel│   │
│  │  (Model Select) │  (State Mgmt)    │  (Model Info)   │   │
│  └────────┬────────┴────────┬─────────┴────────┬────────┘   │
│           │                 │                  │              │
│           └─────────────────┼──────────────────┘              │
│                             │                                 │
│                    /api/models/* (REST API)                  │
│                             ↓                                 │
├─────────────────────────────────────────────────────────────┤
│                        后端应用                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            models.py (API Routes)                     │  │
│  │  • GET  /api/models                                   │  │
│  │  • GET  /api/models/{model_id}                        │  │
│  │  • POST /api/models/{model_id}/api-keys               │  │
│  │  • GET  /api/models/{model_id}/configs                │  │
│  └───────────────────┬─────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼─────────────────────────────────┐  │
│  │    model_service.py (Service Layer)                  │  │
│  │  • ModelService                                       │  │
│  │  • ProviderManager                                    │  │
│  │  • ModelAPIKeyManager                                 │  │
│  │  • ModelConfigManager                                 │  │
│  └───────────────────┬─────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼─────────────────────────────────┐  │
│  │       database.py (Connection Pool)                  │  │
│  │     PostgreSQL (Direct SQL Queries)                  │  │
│  └───────────────────┬─────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼─────────────────────────────────┐  │
│  │       ai_generator.py (Image Generation)            │  │
│  │  • generate_with_openai()                             │  │
│  │  • generate_with_stability()                          │  │
│  │  • generate_with_huggingface()                        │  │
│  │  • generate_image() (Unified Interface)               │  │
│  └───────────────────┬─────────────────────────────────┘  │
│                      │                                      │
│  ┌───────────────────▼─────────────────────────────────┐  │
│  │    task_manager.py (Task Execution)                  │  │
│  │  • execute_task() - Calls AI APIs with real keys     │  │
│  │  • Handles image download and storage                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 数据库设计

### 1. AI提供商表 (ai_providers)
存储AI服务提供商信息（OpenAI、Stability AI、Hugging Face等）

```sql
CREATE TABLE ai_providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_url TEXT NOT NULL,
    api_key_header VARCHAR(50) DEFAULT 'Authorization',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 模型表 (models)
存储AI模型信息

```sql
CREATE TABLE models (
    id VARCHAR(50) PRIMARY KEY,
    provider_id VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    model_type VARCHAR(50) NOT NULL DEFAULT 'image_generation',
    input_params JSONB,
    output_format VARCHAR(50) DEFAULT 'image',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id),
    UNIQUE(provider_id, model_name)
);
```

### 3. API密钥管理表 (model_api_keys)
存储每个模型的API密钥，支持配额管理

```sql
CREATE TABLE model_api_keys (
    id VARCHAR(50) PRIMARY KEY,
    model_id VARCHAR(50) NOT NULL,
    api_key VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    quota_limit INTEGER,
    quota_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);
```

### 4. 模型配置表 (model_configs)
存储模型的自定义配置（如定价、参数限制等）

```sql
CREATE TABLE model_configs (
    id VARCHAR(50) PRIMARY KEY,
    model_id VARCHAR(50) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
    UNIQUE(model_id, config_key)
);
```

## 后端实现

### 1. 服务层 (app/services/model_service.py)

提供四个核心管理类：

#### ProviderManager - 提供商管理
```python
class ProviderManager:
    @staticmethod
    def get_all_providers() -> List[Dict]
    @staticmethod
    def get_provider_by_id(provider_id: str) -> Optional[Dict]
    @staticmethod
    def create_provider(...) -> str
```

#### ModelService - 模型管理
```python
class ModelService:
    @staticmethod
    def get_all_models(active_only: bool = True) -> List[Dict]
    @staticmethod
    def get_model_by_id(model_id: str) -> Optional[Dict]
    @staticmethod
    def get_model_by_name(model_name: str) -> Optional[Dict]
    @staticmethod
    def create_model(...) -> str
    @staticmethod
    def update_model(model_id: str, **updates) -> bool
    @staticmethod
    def delete_model(model_id: str) -> bool
```

#### ModelAPIKeyManager - API密钥管理
```python
class ModelAPIKeyManager:
    @staticmethod
    def get_active_key(model_id: str) -> Optional[Dict]
    @staticmethod
    def create_api_key(...) -> str
    @staticmethod
    def update_quota_used(key_id: str, increment: int = 1) -> bool
    @staticmethod
    def deactivate_key(key_id: str) -> bool
```

#### ModelConfigManager - 配置管理
```python
class ModelConfigManager:
    @staticmethod
    def get_config(model_id: str, config_key: str) -> Optional[Dict]
    @staticmethod
    def get_all_configs(model_id: str) -> List[Dict]
    @staticmethod
    def set_config(...) -> str
    @staticmethod
    def delete_config(config_id: str) -> bool
```

### 2. AI生成服务 (app/services/ai_generator.py)

提供统一的AI图像生成接口，支持多个提供商：

```python
class AIImageGenerator:
    async def generate_with_openai(...) -> Dict
    async def generate_with_stability(...) -> Dict
    async def generate_with_huggingface(...) -> Dict
    async def generate_image(...) -> Dict  # 统一接口
```

**使用示例：**
```python
generator = AIImageGenerator()
result = await generator.generate_image(
    provider_name="openai",
    model_name="dall-e-3",
    prompt="A beautiful sunset over the ocean",
    api_key="sk-xxxx..."
)
```

### 3. 任务管理改造 (app/services/task_manager.py)

`execute_task()` 函数现在支持调用真实的AI API：

```python
async def execute_task(
    task_id: str, 
    prompt: str, 
    generated_dir: Path, 
    tasks_dir: Path, 
    model_name: str = None
) -> None:
    """
    执行生成任务
    - 如果提供model_name，查询数据库获取对应的API密钥
    - 调用真实的AI API生成图片
    - 如果API调用失败或model_name为空，使用占位图片
    """
```

流程：
1. 解析model_name获取模型配置
2. 获取该模型的活跃API密钥
3. 根据provider调用对应的API生成接口
4. 保存生成的图片到media/generated目录
5. 更新任务状态和API配额

### 4. API路由 (app/api/models.py)

提供RESTful API接口：

#### 获取模型列表
```
GET /api/models
Response: {
  "models": [
    {
      "id": "model_dall3",
      "modelId": "dall-e-3",
      "displayName": "DALL-E 3",
      "provider": "openai",
      "providerDisplayName": "OpenAI",
      ...
    }
  ],
  "total": 5
}
```

#### 获取模型详情
```
GET /api/models/{model_id}
Response: {
  "id": "model_dall3",
  "model_name": "dall-e-3",
  "display_name": "DALL-E 3",
  "provider": { ... },
  "api_keys": [ ... ],
  "configs": [ ... ]
}
```

#### 管理API密钥
```
POST /api/models/{model_id}/api-keys
Request: {
  "api_key": "sk-xxxx...",
  "quota_limit": 1000
}
```

#### 管理模型配置
```
POST /api/models/{model_id}/configs
GET  /api/models/{model_id}/configs
GET  /api/models/{model_id}/configs/{config_key}
```

## 前端实现

### 1. 模型API客户端 (src/api/models.ts)

```typescript
// 获取可用模型列表
export const getAvailableModels = async (): Promise<AvailableModelsResponse>

// 获取模型详情
export const getModelDetail = async (modelId: string): Promise<ModelDetail>

// 获取模型配置
export const getModelConfigs = async (modelId: string)
export const getModelConfig = async (modelId: string, configKey: string)

// 获取所有提供商
export const getAllProviders = async ()
```

### 2. 状态管理改造 (src/store/generationStore.ts)

扩展为包含模型列表和加载状态：

```typescript
interface GenerationStore {
  // 原有字段
  currentPrompt: string
  currentModel: string
  currentParams: GenerateParams
  
  // 新增字段
  models: Model[]
  modelsLoading: boolean
  modelsError: string | null
  
  // 新增方法
  loadModels: () => Promise<void>
  setModels: (models: Model[]) => void
  setModelsLoading: (loading: boolean) => void
  setModelsError: (error: string | null) => void
}
```

### 3. BottomPanel改造

主要改进：
- **自动加载模型列表**：组件挂载时调用`loadModels()`
- **动态渲染下拉菜单**：从服务器获取的模型列表渲染Options
- **显示模型信息**：点击信息图标显示当前模型的详细信息
- **加载状态处理**：显示Loading状态，禁用生成按钮
- **错误处理**：捕获模型加载失败的错误

### 4. 模型配置展示组件 (src/components/ModelConfigPanel/ModelConfigPanel.tsx)

独立组件用于显示模型详细配置：

**功能：**
- 展示模型基本信息
- 展示提供商信息
- 展示输入参数
- 展示自定义配置
- 展示API密钥状态

**使用：**
```tsx
<ModelConfigPanel modelId="model_dall3" />
```

## 工作流程

### 用户生成图片的完整流程

1. **用户打开应用**
   - 前端加载BottomPanel
   - BottomPanel调用`loadModels()`
   - 获取所有可用模型，展示在下拉菜单中

2. **用户选择模型**
   - 在下拉菜单中选择一个模型
   - 点击信息图标查看模型详情
   - 输入生成提示词
   - 可选：选择图片作为参考

3. **用户点击生成按钮**
   - 前端调用`createGenerateTask()`
   - 后端接收请求，记录`modelName`到数据库
   - 添加后台任务并返回taskId给前端
   - 前端创建生成节点并定期轮询状态

4. **后端执行生成任务**
   - `execute_task()` 被调用
   - 根据`modelName`查询数据库获取模型配置
   - 获取该模型的活跃API密钥
   - 调用AIImageGenerator生成接口
   - 根据provider调用对应的API（OpenAI、Stability等）
   - 保存生成的图片到本地
   - 更新任务状态为成功
   - 更新API配额

5. **前端接收结果**
   - 轮询获取到status="success"
   - 在生成节点下方显示生成的图片
   - 用户可以继续在这些图片上进行操作

### API调用过程详解

以OpenAI为例：

```python
# 1. 后端获取模型信息
model = ModelService.get_model_by_name("dall-e-3")
# {
#   "id": "model_dall3",
#   "model_name": "dall-e-3",
#   "provider_name": "openai",
#   "provider_id": "provider_openai",
#   "base_url": "https://api.openai.com/v1",
#   ...
# }

# 2. 获取API密钥
api_key = ModelAPIKeyManager.get_active_key(model['id'])
# {
#   "id": "key_xxx",
#   "api_key": "sk-...",
#   "quota_limit": 1000,
#   "quota_used": 50,
#   ...
# }

# 3. 调用生成接口
result = await generator.generate_image(
    provider_name="openai",
    model_name="dall-e-3",
    prompt=prompt,
    api_key=api_key['api_key']
)

# 4. 处理返回结果
if result['success']:
    # 获取图片URLs
    for image_url in result['images']:
        # 下载并保存图片
        img_data = await download_image(image_url)
        # 保存到 media/generated/{image_id}.png
```

## 支持的AI提供商

### 1. OpenAI (DALL-E)
- **基础URL**: https://api.openai.com/v1
- **API**: `/images/generations`
- **认证**: Bearer Token (Authorization header)
- **支持模型**:
  - `dall-e-3`: 最新版本，高质量输出
  - `dall-e-2`: 标准版本

**API请求示例**:
```bash
curl https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{
    "model": "dall-e-3",
    "prompt": "A sunset over mountains",
    "n": 1,
    "size": "1024x1024"
  }'
```

### 2. Stability AI
- **基础URL**: https://api.stability.ai/v1
- **API**: `/generation/{engine_id}/text-to-image`
- **认证**: Bearer Token
- **支持模型**:
  - `stable-diffusion-xl-1024-v1-0`: Stable Diffusion XL
  - `stable-diffusion-3-large`: Stable Diffusion 3
  - `midjourney-v6`: Midjourney v6

**API请求示例**:
```bash
curl https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image \
  -H "Authorization: Bearer $STABILITY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text_prompts": [{"text": "A sunset over mountains", "weight": 1.0}],
    "steps": 20,
    "cfg_scale": 7.0,
    "samples": 1
  }'
```

### 3. Hugging Face
- **基础URL**: https://api-inference.huggingface.co
- **API**: `/models/{model_id}`
- **认证**: Bearer Token
- **支持模型**: 任何Hugging Face上的图像生成模型

**API请求示例**:
```bash
curl -X POST \
  -H "Authorization: Bearer hf_..." \
  https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1 \
  --data-binary '{"inputs": "A sunset over mountains"}'
```

## 配置和部署

### 1. 数据库初始化

```bash
# 执行迁移脚本
psql -U postgres -d picture -f backend/app/migrations/add_model_management.sql
```

### 2. 环境变量配置

```bash
# .env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=picture
DB_USER=postgres
DB_PASSWORD=root

# 模型相关（可选）
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=...
HUGGINGFACE_API_KEY=...
```

### 3. 添加API密钥

通过后端API添加模型的API密钥：

```bash
curl -X POST http://localhost:8000/api/models/model_dall3/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sk-...",
    "quota_limit": 1000
  }'
```

或通过SQL直接插入：

```sql
INSERT INTO model_api_keys (id, model_id, api_key, quota_limit)
VALUES (
  'key_' || random()::text,
  'model_dall3',
  'sk-...',
  1000
);
```

## 测试

运行测试脚本验证系统：

```bash
cd backend
python -m pytest test/test_model_management.py -v

# 或直接运行
python test/test_model_management.py
```

测试覆盖：
- ✅ 数据库连接
- ✅ Provider管理操作
- ✅ Model管理操作
- ✅ API密钥管理
- ✅ 配置管理

## 常见问题

### Q: 如何添加新的AI提供商？

A: 
1. 在数据库中创建新的provider
2. 在ai_generator.py中添加新的`generate_with_xxx()`方法
3. 在`generate_image()`方法中添加对应的条件分支
4. 添加相应的模型到数据库

### Q: 如何管理多个API密钥？

A:
- 每个模型可以有多个API密钥
- 系统自动选择活跃且未过期的密钥
- 支持设置配额限制和自动轮换

### Q: 生成失败时会发生什么？

A:
- 如果API调用失败，系统自动使用占位图片
- 任务状态会被标记为"failed"，包含错误信息
- 用户可以查看错误详情并重试

### Q: 如何扩展到本地模型？

A:
1. 创建provider类型为"local"
2. 设置base_url指向本地服务（如http://localhost:8001）
3. 在ai_generator.py中添加`generate_with_local()`方法
4. 实现HTTP调用到本地服务的逻辑

## 下一步建议

1. **认证和授权**：添加用户和权限管理
2. **费用追踪**：记录每个用户的API调用费用
3. **缓存优化**：缓存模型列表到前端（Redis）
4. **监控告警**：监控API额度和费用
5. **异步队列**：使用Celery替换BackgroundTasks
6. **WebSocket**：实时推送生成进度而不是轮询

---

**完成时间**: 2025年12月24日
**版本**: 1.0
