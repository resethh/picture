-- 添加 is_public 字段到 projects 表
-- 用于标识项目是否公开（优秀案例）

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 为 is_public 字段添加索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);

-- 为公开项目查询创建复合索引
CREATE INDEX IF NOT EXISTS idx_projects_public_updated ON projects(is_public, updated_at DESC);
