-- 数据库初始化脚本
-- 创建项目表
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    graph JSONB NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建生成任务表
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    image_ids TEXT[] NOT NULL,
    mode VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    ratio VARCHAR(20) DEFAULT '1:1',
    count INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result_images JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建上传图片表（可选，用于管理上传的图片）
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(50) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size INTEGER,
    data BYTEA,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建更新时间触发器函数
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- -- 为 projects 表添加更新时间触发器
-- DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
-- CREATE TRIGGER update_projects_updated_at
--     BEFORE UPDATE ON projects
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- -- 为 tasks 表添加更新时间触发器
-- DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
-- CREATE TRIGGER update_tasks_updated_at
--     BEFORE UPDATE ON tasks
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);
