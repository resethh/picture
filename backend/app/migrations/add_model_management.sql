-- 添加AI模型管理相关表

-- 1. AI提供商表（如OpenAI、Stability AI等）
CREATE TABLE IF NOT EXISTS ai_providers (
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

-- 2. AI模型表
CREATE TABLE IF NOT EXISTS models (
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

-- 3. 模型API密钥管理表
CREATE TABLE IF NOT EXISTS model_api_keys (
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

-- 4. 模型配置表（预设参数、费用等）
CREATE TABLE IF NOT EXISTS model_configs (
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_models_provider_id ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);
CREATE INDEX IF NOT EXISTS idx_model_api_keys_model_id ON model_api_keys(model_id);
CREATE INDEX IF NOT EXISTS idx_model_configs_model_id ON model_configs(model_id);

-- 初始化提供商数据
INSERT INTO ai_providers (id, name, display_name, base_url, description) VALUES
('provider_openai', 'openai', 'OpenAI', 'https://api.openai.com/v1', 'OpenAI API服务'),
('provider_stability', 'stability', 'Stability AI', 'https://api.stability.ai/v1', 'Stability AI生成服务'),
('provider_huggingface', 'huggingface', 'Hugging Face', 'https://api-inference.huggingface.co', 'Hugging Face推理API'),
('provider_local', 'local', '本地模型', 'http://localhost:8001', '本地部署模型')
ON CONFLICT (name) DO NOTHING;

-- 初始化模型数据
INSERT INTO models (id, provider_id, model_name, display_name, description, model_type, sort_order) VALUES
('model_dall3', 'provider_openai', 'dall-e-3', 'DALL-E 3', 'OpenAI最新图像生成模型，高质量输出', 'image_generation', 1),
('model_dall2', 'provider_openai', 'dall-e-2', 'DALL-E 2', 'OpenAI图像生成模型', 'image_generation', 2),
('model_stable_xl', 'provider_stability', 'stable-diffusion-xl-1024-v1-0', 'Stable Diffusion XL', 'Stability AI最新扩散模型', 'image_generation', 3),
('model_stable_3', 'provider_stability', 'stable-diffusion-3-large', 'Stable Diffusion 3', 'Stability AI新一代扩散模型', 'image_generation', 4),
('model_midjourney', 'provider_stability', 'midjourney-v6', 'Midjourney v6', 'Midjourney最新版本', 'image_generation', 5)
ON CONFLICT DO NOTHING;
