# 部署检查清单 - 模型管理系统

## 📋 部署前准备

### 环境验证
- [ ] Python 3.9+ 已安装
- [ ] PostgreSQL 12+ 已安装并运行
- [ ] Node.js 16+ 已安装
- [ ] npm 或 yarn 已安装

### 依赖安装
- [ ] 后端依赖：`pip install -r backend/requirements.txt`
  - [ ] 验证新增依赖：`httpx>=0.24.0`, `aiohttp>=3.8.0`
- [ ] 前端依赖：`npm install`

---

## 🗄️ 数据库部署

### 1. 初始化模型管理表

```bash
# 使用正确的数据库凭证
psql -U postgres -d picture -f backend/app/migrations/add_model_management.sql
```

**验证**:
```sql
-- 检查表是否创建
SELECT * FROM pg_tables WHERE tablename IN (
  'ai_providers', 'models', 'model_api_keys', 'model_configs'
);

-- 检查初始数据
SELECT COUNT(*) FROM ai_providers;  -- 应该是 4
SELECT COUNT(*) FROM models;        -- 应该是 5
```

### 2. 验证数据库连接

```bash
# 运行测试脚本
python backend/test/test_model_management.py
```

**预期输出**:
```
=== Testing Database Connection ===
✅ Database connected successfully

=== Testing Provider Operations ===
✅ Found 4 providers:
   - OpenAI
   - Stability AI
   - Hugging Face
   - Local Model

[... 其他测试通过 ...]

Total: 5/5 tests passed
```

---

## 🔧 后端部署

### 1. 配置检查

```bash
# 验证 .env 文件
cat backend/.env.example  # 查看模板
# 创建实际配置文件
cp backend/.env.example backend/.env
```

**必须配置**:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=picture
DB_USER=postgres
DB_PASSWORD=<your_password>
```

### 2. 启动后端服务

```bash
# 启动开发服务器
cd backend
python run.py

# 或使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**验证启动成功**:
- [ ] 无Python错误
- [ ] 日志显示: "✅ PostgreSQL 数据库已连接"
- [ ] 访问 http://localhost:8000/docs - Swagger UI 可访问

### 3. 添加API密钥

```bash
# 选项 1: 通过 API 添加
curl -X POST http://localhost:8000/api/models/model_dall3/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "sk-your-key-here",
    "quota_limit": 1000,
    "expires_at": "2025-12-31T23:59:59Z"
  }'

# 选项 2: 通过 SQL 直接添加
psql -U postgres -d picture << EOF
INSERT INTO model_api_keys (id, model_id, api_key, quota_limit)
VALUES (
  'key_openai_' || substr(md5(random()::text), 1, 8),
  'model_dall3',
  'sk-your-key-here',
  1000
);
EOF
```

**验证**:
```bash
curl http://localhost:8000/api/models
```

应该能看到模型列表。

### 4. API 端点验证

```bash
# 测试各个端点
curl http://localhost:8000/api/models                    # 获取模型列表
curl http://localhost:8000/api/models/model_dall3        # 获取模型详情
curl http://localhost:8000/api/models/providers          # 获取提供商列表
```

---

## 🎨 前端部署

### 1. 构建检查

```bash
cd frontend

# 验证 TypeScript 编译
npx tsc --noEmit

# 构建生产版本
npm run build

# 验证构建产物
ls -la dist/
```

**验证构建成功**:
- [ ] 无TypeScript错误
- [ ] `dist/` 目录包含 `index.html`
- [ ] `dist/assets/` 包含 `.js` 和 `.css` 文件

### 2. 开发服务器启动

```bash
# 启动开发服务器
npm run dev

# 输出应该显示: http://localhost:5173
```

**在浏览器中验证**:
- [ ] 访问 http://localhost:5173
- [ ] 应用成功加载
- [ ] 下方生成面板显示

### 3. 模型加载验证

**在浏览器控制台检查**:
```javascript
// 打开开发者工具 (F12) → Console

// 应该能看到模型加载
console.log('Models loaded');

// 检查网络请求
// 应该有 GET /api/models 请求
// 状态码应该是 200
// 响应包含模型列表
```

**UI 验证**:
- [ ] 模型选择下拉菜单显示模型列表
- [ ] 点击信息图标显示模型详情
- [ ] 输入提示词并点击生成按钮

---

## 🧪 功能测试

### 1. 模型选择流程

```
步骤 1: 打开应用
       ✓ BottomPanel 加载
       ✓ 模型列表从服务器加载
       
步骤 2: 选择模型
       ✓ 下拉菜单显示模型
       ✓ 选择后 currentModel 更新
       
步骤 3: 查看模型信息
       ✓ 点击 info 图标
       ✓ 显示弹框包含模型详情
```

### 2. 生成流程（需要API密钥）

```
步骤 1: 配置必要参数
       ✓ 选择模型
       ✓ 输入提示词
       
步骤 2: 点击生成
       ✓ 创建生成任务
       ✓ 后台开始执行
       
步骤 3: 监控进度
       ✓ 任务状态更新
       ✓ 进度条推进
       
步骤 4: 查看结果
       ✓ 生成成功显示图片
       或
       ✓ 生成失败显示占位图片（如果没有API密钥）
```

### 3. 错误处理

```
场景 1: 数据库未连接
       ✓ 后端启动失败，显示错误
       ✓ 前端无法加载模型
       
场景 2: API 密钥无效
       ✓ 模型能显示
       ✓ 生成时返回错误
       ✓ 自动降级到占位图片
       
场景 3: API 调用超时
       ✓ 显示超时错误
       ✓ 允许重试
```

---

## 📊 性能检查

### 1. 页面加载时间

```bash
# 使用 Lighthouse
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

**目标**:
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s

### 2. API 响应时间

```bash
# 测试 /api/models 端点
time curl http://localhost:8000/api/models > /dev/null

# 目标: < 200ms
```

### 3. 数据库查询性能

```sql
-- 检查索引
SELECT * FROM pg_indexes WHERE tablename IN (
  'models', 'model_api_keys', 'model_configs'
);

-- 分析慢查询
EXPLAIN ANALYZE SELECT * FROM models WHERE is_active = true;
```

---

## 🔒 安全检查

### 1. API 密钥安全

- [ ] API 密钥从不在日志中输出
- [ ] API 密钥从不在响应中返回（除了创建时）
- [ ] 密钥存储在数据库中加密（推荐）

### 2. 数据库安全

- [ ] PostgreSQL 用户有强密码
- [ ] 仅允许本地连接（生产环境）
- [ ] 启用SSL连接（可选，生产环境）

### 3. CORS 配置

```python
# backend/app/main.py 中的 CORS 设置
# 生产环境应该限制具体的origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # 改为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📋 最终检查清单

### 后端
- [ ] 数据库表已创建
- [ ] 初始数据已导入
- [ ] 后端服务已启动
- [ ] API 端点可访问
- [ ] 测试脚本通过
- [ ] 至少添加了一个API密钥

### 前端
- [ ] 依赖已安装
- [ ] TypeScript 编译成功
- [ ] 开发服务器已启动
- [ ] 应用在浏览器中加载
- [ ] 模型列表已加载
- [ ] 所有 UI 元素可见

### 集成
- [ ] 前后端连接正常
- [ ] 模型列表动态加载
- [ ] 模型信息正确展示
- [ ] 没有浏览器控制台错误

---

## 🚀 生产部署

### Docker 部署（推荐）

```bash
# 使用现有的 Dockerfile
docker-compose up -d

# 验证服务
docker ps
docker logs <container_id>
```

### 手动部署

```bash
# 后端（使用 Gunicorn）
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app

# 前端（使用 Nginx）
# 1. npm run build
# 2. 在 Nginx 配置中指向 dist/ 目录
# 3. 配置反向代理指向后端
```

---

## 📞 故障排查

### 问题 1: 数据库连接失败

```bash
# 检查 PostgreSQL 状态
psql -U postgres -d picture

# 检查连接池配置
# 在 backend/app/config.py 中检查 DB_CONFIG

# 检查防火墙
sudo ufw allow 5432
```

### 问题 2: 模型列表不显示

```bash
# 检查后端是否运行
curl -v http://localhost:8000/api/models

# 检查浏览器控制台错误
# F12 → Console 标签

# 检查网络请求
# F12 → Network 标签 → 搜索 "models"
```

### 问题 3: 生成失败

```bash
# 检查 API 密钥
SELECT * FROM model_api_keys WHERE is_active = true;

# 检查后端日志
# 查看 execute_task 的错误信息

# 尝试手动调用 API
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📝 部署记录

| 日期 | 检查项 | 状态 | 备注 |
|------|--------|------|------|
| | 数据库初始化 | | |
| | 后端启动 | | |
| | 前端构建 | | |
| | 模型加载 | | |
| | API 密钥添加 | | |
| | 生成测试 | | |
| | 生产部署 | | |

---

**完成日期**: ___________

**部署负责人**: ___________

**签名**: _________________
