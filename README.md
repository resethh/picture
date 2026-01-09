# AI 设计工作台

一个基于 React + FastAPI + PostgreSQL 的 AI 图像生成平台，支持多图上传、AI 生图、项目管理和分享功能。

## 功能特性

### 🎨 核心功能

#### 1. 三模块导航系统
- **优秀案例**：展示所有公开分享的项目，供用户浏览和学习
- **我的设计**：展示用户自己创建的私有项目
- **无限画布**：基于 ReactFlow 的可视化画布编辑器

#### 2. 项目管理
- ✅ 项目列表展示（网格布局）
- ✅ 项目创建与保存（支持新建/更新）
- ✅ 双击项目在新标签页打开
- ✅ 项目自动加载（通过 URL 参数传递 projectId）
- ✅ 项目分享到公共空间（复制副本）
- ✅ 日期格式化显示

#### 3. AI 图像生成
- 多图上传支持
- 选择部分图片进行 AI 生成
- 生成节点与输入节点自动连线
- 实时生成进度跟踪

#### 4. 画布编辑
- 基于 ReactFlow 的无限画布
- 图片节点和生成节点
- 节点连线关系管理
- 框选模式支持

## 技术栈

### 前端
- **React 18** + TypeScript
- **ReactFlow** - 可视化画布
- **Zustand** - 状态管理
- **Ant Design** - UI 组件库
- **Vite** - 构建工具
- **Axios** - HTTP 客户端

### 后端
- **FastAPI** - Python Web 框架
- **PostgreSQL** - 数据库
- **Psycopg2** - PostgreSQL 连接池
- **Pydantic** - 数据验证

## 项目结构

```
picturev1/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API 接口
│   │   │   ├── http.ts
│   │   │   ├── projects.ts
│   │   │   ├── images.ts
│   │   │   └── generate.ts
│   │   ├── components/      # React 组件
│   │   │   ├── Canvas/      # 画布组件
│   │   │   ├── TopBar/      # 顶部导航
│   │   │   ├── BottomPanel/ # 底部面板
│   │   │   └── RightToolbar/# 右侧工具栏
│   │   ├── pages/           # 页面组件
│   │   │   ├── Home.tsx           # 首页（含侧边栏导航）
│   │   │   ├── ExcellentCases.tsx # 优秀案例页
│   │   │   ├── MyProjects.tsx     # 我的设计页
│   │   │   └── CanvasPage.tsx     # 画布页面
│   │   ├── store/           # 状态管理
│   │   │   ├── projectStore.ts    # 项目状态
│   │   │   └── generationStore.ts # 生成状态
│   │   └── types/           # TypeScript 类型定义
│   └── package.json
│
├── backend/                 # 后端项目
│   ├── app/
│   │   ├── api/            # API 路由
│   │   │   ├── projects.py  # 项目相关 API
│   │   │   ├── images.py    # 图片相关 API
│   │   │   └── generate.py  # 生成相关 API
│   │   ├── services/       # 业务逻辑
│   │   │   ├── db_storage.py    # 数据库操作
│   │   │   ├── ai_generator.py  # AI 生成服务
│   │   │   └── task_manager.py  # 任务管理
│   │   ├── schemas/        # Pydantic 模型
│   │   ├── utils/          # 工具函数
│   │   ├── config.py       # 配置文件
│   │   ├── database.py     # 数据库连接
│   │   └── main.py         # 应用入口
│   ├── migrations/         # 数据库迁移
│   │   └── add_is_public_field.sql
│   ├── requirements.txt
│   └── run.py
│
└── README.md
```

## 数据库设计

### 主要数据表

#### projects（项目表）
```sql
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    graph JSONB NOT NULL,          -- 画布数据（节点、边、视图）
    thumbnail TEXT,                 -- 缩略图
    is_public BOOLEAN DEFAULT FALSE,-- 是否公开
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

#### tasks（生成任务表）
```sql
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    image_ids TEXT[] NOT NULL,
    mode VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    ratio VARCHAR(20) DEFAULT '1:1',
    count INTEGER DEFAULT 1,
    status VARCHAR(20) NOT NULL,
    progress INTEGER DEFAULT 0,
    result_images JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

#### images（图片表）
```sql
CREATE TABLE images (
    id VARCHAR(50) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size INTEGER,
    data BYTEA,                    -- 图片二进制数据
    created_at TIMESTAMP WITH TIME ZONE
);
```

## 快速开始

### 方式一：Docker 部署（推荐）

#### 环境要求
- Docker 20.10+
- Docker Compose 2.0+

#### 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd picturev1

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

启动后访问：
- 前端：`http://localhost`
- 后端 API：`http://localhost:8000`
- 数据库：`localhost:5432`

#### Docker 服务管理

```bash
# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service_name]

# 进入容器
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d picture
```

#### 生产环境配置

修改 `docker-compose.yml` 中的环境变量：

```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: your_secure_password

backend:
  environment:
    DB_PASSWORD: your_secure_password
```

### 方式二：本地开发部署

### 环境要求
- Node.js 16+
- Python 3.9+
- PostgreSQL 12+

### 1. 数据库初始化

```bash
# 创建数据库
createdb picture

# 运行初始化脚本
psql -d picture -f backend/app/init_db.sql

# 运行数据库迁移
cd backend
python -m app.run_migration
```

### 2. 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（可选，使用默认配置）
# cp .env.example .env

# 启动服务
python run.py
```

后端服务将运行在 `http://localhost:8000`

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将运行在 `http://localhost:5173`

## 使用流程

### 基本操作

1. **访问首页**
   - 打开 `http://localhost:5173`
   - 默认显示"优秀案例"页面

2. **创建项目**
   - 点击侧边栏"无限画布"
   - 在新标签页打开空白画布
   - 上传图片或创建生成节点
   - 点击"保存"按钮，输入项目名称

3. **打开已有项目**
   - 在"我的设计"中查看自己的项目
   - 双击项目卡片，在新标签页打开
   - 项目内容自动加载到画布

4. **分享项目**
   - 在画布页面点击"分享"按钮
   - 项目副本将出现在"优秀案例"中
   - 原项目保持私有

### 项目管理

- **新建项目**：点击"无限画布" → 编辑 → 保存
- **更新项目**：打开已有项目 → 编辑 → 保存（使用相同 ID）
- **查看私有项目**：切换到"我的设计"
- **查看公开项目**：切换到"优秀案例"

## API 接口

### 项目相关

```
GET    /api/projects         # 获取私有项目列表
GET    /api/projects/public  # 获取公开项目列表
GET    /api/projects/:id     # 获取项目详情
POST   /api/projects         # 创建/更新项目
POST   /api/projects/:id/share # 分享项目到公共空间
```

### 图片相关

```
POST   /api/images/upload    # 上传图片
GET    /api/images/:id       # 获取图片
```

### 生成相关

```
POST   /api/generate         # 创建生成任务
GET    /api/generate/:id     # 获取任务状态
```

## 配置说明

### 后端配置（backend/app/config.py）

```python
# 数据库配置
DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "picture",
    "user": "postgres",
    "password": "root",
    "min_conn": 1,
    "max_conn": 10
}

# 服务器配置
HOST = "0.0.0.0"
PORT = 8000
```

可以通过环境变量覆盖：
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### 前端配置（frontend/vite.config.ts）

```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## 常见问题

### 1. 项目列表为空？
- 检查数据库连接是否正常
- 确认已运行数据库迁移（添加 `is_public` 字段）
- 查看浏览器控制台和后端日志

### 2. 双击项目后画布为空？
- 确认 URL 中包含 `?projectId=xxx` 参数
- 检查浏览器控制台是否有加载错误
- 验证项目数据在数据库中存在

### 3. 日期显示异常？
- 确认后端返回的日期格式正确（ISO 8601）
- 检查浏览器时区设置

### 4. 图片上传失败？
- 检查文件大小（限制 10MB）
- 验证文件格式（支持 jpg, png, webp）
- 确认媒体目录有写权限

## 开发指南

### 添加新功能

1. **添加新页面**
   - 在 `frontend/src/pages/` 创建组件
   - 在 `App.tsx` 添加路由
   - 更新导航菜单

2. **添加新 API**
   - 在 `backend/app/api/` 创建路由文件
   - 在 `backend/app/schemas/` 定义数据模型
   - 在 `backend/app/services/` 实现业务逻辑
   - 在 `main.py` 注册路由

3. **数据库变更**
   - 创建迁移脚本在 `backend/migrations/`
   - 编写 SQL 语句
   - 运行迁移脚本

### 代码规范

- 前端使用 TypeScript + ESLint
- 后端使用 Python type hints
- 遵循 RESTful API 设计原则
- 使用 camelCase 命名（前端）和 snake_case（后端）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## Docker 架构

### 服务组成

```
┌────────────────────────────────────────────┐
│           Docker Compose 编排               │
└────────────────────────────────────────────┘
           │                  │                  │
           │                  │                  │
  ┌────────┴────────┐  ┌──────┴──────┐  ┌──────┴──────┐
  │   Frontend    │  │  Backend  │  │ PostgreSQL │
  │  (Nginx)     │  │ (FastAPI)│  │ (Database) │
  │  Port: 80    │  │ Port: 8000│  │ Port: 5432 │
  └─────────────────┘  └────────────┘  └────────────┘
       │                  │                  │
       │ /api proxy     │ DB connection    │
       └──────────────────┴──────────────────┘
```

### 数据持久化

Docker Compose 创建了三个数据卷：
- `postgres_data`: 数据库数据
- `backend_data`: 项目和任务数据
- `backend_media`: 上传和生成的图片

### 端口映射

| 服务       | 容器端口 | 主机端口 | 说明              |
|------------|----------|----------|-------------------|
| Frontend   | 80       | 80       | Web 界面         |
| Backend    | 8000     | 8000     | API 服务         |
| PostgreSQL | 5432     | 5432     | 数据库服务       |

### 环境变量

后端容器支持以下环境变量：

| 变量名        | 默认值      | 说明           |
|---------------|-------------|----------------|
| DB_HOST       | postgres    | 数据库主机     |
| DB_PORT       | 5432        | 数据库端口     |
| DB_NAME       | picture     | 数据库名       |
| DB_USER       | postgres    | 数据库用户     |
| DB_PASSWORD   | root        | 数据库密码     |
| DB_MIN_CONN   | 1           | 最小连接池     |
| DB_MAX_CONN   | 10          | 最大连接池     |

### 部署注意事项

1. **生产环境安全**
   - 修改默认数据库密码
   - 使用 HTTPS（通过 Nginx 或 反向代理）
   - 限制数据库端口访问（不对外暴露 5432）

2. **性能优化**
   - 调整 PostgreSQL 连接池大小
   - 配置 Nginx 缓存
   - 使用 Redis 缓存（可选）

3. **监控和日志**
   - 使用 `docker-compose logs` 查看日志
   - 配置日志轮转
   - 集成监控工具（如 Prometheus）

4. **备份策略**
   ```bash
   # 备份数据库
   docker-compose exec postgres pg_dump -U postgres picture > backup.sql
   
   # 备份数据卷
   docker run --rm -v picturev1_postgres_data:/data -v $(pwd):/backup \
     alpine tar czf /backup/postgres_data.tar.gz -C /data .
   ```
