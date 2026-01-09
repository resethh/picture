# 页面价格模型维护模块 - 完整指南

## 📍 功能概述

已为您创建了一个**完整的模型和API管理页面**，用于维护：
- ✅ 模型列表
- ✅ API密钥（URL、Key、配额等）
- ✅ 模型配置（定价、参数限制等）

---

## 🎯 核心功能

### 1. 模型列表展示
显示所有可用的AI模型，包括：
- 模型名称和描述
- 所属提供商（OpenAI、Stability AI等）
- 已配置的API密钥数量
- 已保存的配置项数量

### 2. API密钥管理
为每个模型添加和管理多个API密钥：
- 添加新的API密钥
- 设置配额限制
- 设置密钥过期时间
- 查看密钥使用情况
- 停用无用的密钥

### 3. 模型配置管理
保存模型相关的配置信息：
- 定价信息
- 参数限制
- 模型参数
- 其他自定义配置

---

## 📂 创建的文件

### 后端无需修改
已有的模型管理API已支持所有操作：
- `GET /api/models` - 获取模型列表
- `POST /api/models/{id}/api-keys` - 添加API密钥
- `GET /api/models/{id}/api-keys` - 获取密钥列表
- `POST /api/models/{id}/configs` - 保存配置

### 前端新增文件

#### 1. 模型管理页面
**文件**: `frontend/src/pages/ModelManagement.tsx`

```typescript
// 主要功能组件
- 模型列表表格
- API密钥管理模态框
- 配置管理模态框
- 密钥可见性切换
```

**特性**:
- ✅ 动态加载模型列表
- ✅ 实时显示API密钥状态
- ✅ JSON格式配置验证
- ✅ 密钥过期时间管理
- ✅ 配额使用情况展示

#### 2. 路由配置更新
**文件**: `frontend/src/App.tsx`

```typescript
// 添加了路由
if (currentPath === '/models') {
  return <ModelManagement />;
}
```

#### 3. 导航菜单更新
**文件**: `frontend/src/pages/Home.tsx`

在主页左侧菜单添加了：
- 🔧 **模型管理** 按钮
- 快捷访问模型管理页面

#### 4. 维护指南
**文件**: `MODEL_MAINTENANCE_GUIDE.md`

包含：
- 页面使用说明
- 各提供商配置指南（OpenAI、Stability、HF）
- 常见问题解答
- 故障排查步骤
- 操作核对清单

#### 5. 快速启动脚本

**Linux/Mac**: `setup.sh`
```bash
bash setup.sh
```

**Windows**: `setup.bat`
```cmd
setup.bat
```

---

## 🚀 快速使用步骤

### 第1步：访问页面
```
主页菜单 → 点击"模型管理" 
或 
直接访问 http://localhost:5173/models
```

### 第2步：添加API密钥

**点击模型的"API密钥"按钮 → 填写信息**

| 字段 | 例子 | 说明 |
|------|------|------|
| API密钥 | `sk-xxxx...` | 从AI服务获取 |
| 配额限制 | `1000` | 可选，限制调用次数 |
| 过期时间 | `2025-12-31` | 可选，设置失效日期 |

### 第3步：配置模型参数

**点击模型的"配置"按钮 → 填写JSON配置**

例如定价配置：
```json
配置键: pricing
配置值: {
  "per_image": 0.02,
  "currency": "USD"
}
```

### 第4步：验证生成

在画布页面选择模型，点击生成，系统会：
1. ✅ 自动查询数据库获取API密钥
2. ✅ 调用对应提供商的API
3. ✅ 生成真实的图片

---

## 🔧 配置示例

### OpenAI DALL-E配置

```json
配置键: openai_settings
配置值: {
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "standard",
  "pricing": {
    "1024x1024": 0.02,
    "1024x1792": 0.025,
    "1792x1024": 0.025
  }
}
```

### Stability AI配置

```json
配置键: stability_settings
配置值: {
  "engine_id": "stable-diffusion-xl-1024-v1-0",
  "steps": 20,
  "cfg_scale": 7.0,
  "pricing": {
    "per_image": 0.01,
    "batch_discount": 0.9
  }
}
```

### 定价管理

```json
配置键: pricing_table
配置值: {
  "models": {
    "dall-e-3": {"price": 0.02, "currency": "USD"},
    "dall-e-2": {"price": 0.016, "currency": "USD"},
    "stable-diffusion-xl": {"price": 0.01, "currency": "USD"}
  },
  "update_date": "2025-12-24"
}
```

---

## 📊 页面布局

```
┌─────────────────────────────────────────────────────────┐
│         模型和API管理                    [新增模型] 按钮 │
├─────────────────────────────────────────────────────────┤
│  模型名称  │  提供商  │  API密钥  │  配置项  │   操作     │
├─────────────────────────────────────────────────────────┤
│ DALL-E 3  │ OpenAI   │   1个    │   2项   │ [API密钥] [配置] │
├─────────────────────────────────────────────────────────┤
│ DALL-E 2  │ OpenAI   │  未配置   │   1项   │ [API密钥] [配置] │
├─────────────────────────────────────────────────────────┤
│ SDXL       │ Stability│   1个    │   3项   │ [API密钥] [配置] │
└─────────────────────────────────────────────────────────┘

点击 [API密钥] → 打开密钥管理弹窗
  ├─ 密钥列表（显示状态、配额、过期时间）
  ├─ [添加API密钥] 按钮
  └─ 每个密钥的 [停用] 按钮

点击 [配置] → 打开配置管理弹窗
  ├─ 配置键输入框
  ├─ 配置值JSON编辑器
  └─ [保存] 按钮
```

---

## 🎨 主要UI组件

### 模型列表表格
```typescript
columns: [
  { title: '模型名称', dataIndex: 'displayName' },
  { title: '提供商', dataIndex: 'provider' },
  { title: 'API密钥', dataIndex: ['apiKeys', 'length'] },
  { title: '配置项', dataIndex: ['configs', 'length'] },
  { title: '操作', render: (_, record) => <API密钥和配置按钮> }
]
```

### API密钥管理表格
```typescript
columns: [
  { title: 'API密钥', 支持显示/隐藏 },
  { title: '状态', 显示活跃/已停用标签 },
  { title: '配额', 显示已使用/总限额 },
  { title: '过期时间', 显示日期或永久有效 },
  { title: '操作', 提供停用按钮 }
]
```

### 配置表单
```typescript
fields: [
  { name: '配置键', type: 'text' },
  { name: '配置值', type: 'textarea', placeholder: '{"key": "value"}' },
  { name: '描述', type: 'textarea' }
]
```

---

## 🔐 安全考虑

### API密钥保护
- ✅ 密钥显示时通过眼睛图标切换
- ✅ 列表中显示缩略版本（前10个字符）
- ✅ 密钥存储在后端数据库中，不在前端缓存

### 配额管理
- ✅ 支持设置调用次数限制
- ✅ 实时显示使用情况
- ✅ 可防止API额度意外耗尽

### 过期管理
- ✅ 支持设置密钥过期时间
- ✅ 过期密钥自动失效
- ✅ 系统会自动选择有效密钥

---

## 📈 工作流程

```
用户打开模型管理页面
    ↓
显示所有模型列表 ← 从数据库加载
    ↓
用户点击模型的"API密钥"按钮
    ↓
显示该模型的密钥管理界面
    ├─ 显示已有的密钥列表
    └─ 提供"添加API密钥"按钮
    ↓
用户填写API密钥信息
    ├─ API Key (必填)
    ├─ 配额限制 (可选)
    └─ 过期时间 (可选)
    ↓
点击"确定"保存
    ↓
后端保存到数据库
    ↓
页面刷新显示新密钥
    ↓
用户可以在生成图片时使用该密钥
```

---

## 📚 相关文档

| 文档 | 用途 |
|------|------|
| [MODEL_MAINTENANCE_GUIDE.md](./MODEL_MAINTENANCE_GUIDE.md) | 详细维护指南和操作说明 |
| [MODEL_MANAGEMENT_IMPLEMENTATION.md](./MODEL_MANAGEMENT_IMPLEMENTATION.md) | 系统实现细节 |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | 完整功能总结 |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | 部署检查清单 |

---

## ❓ 常见问题

**Q: 如何快速启动应用？**
A: 
- Windows: 双击 `setup.bat`
- Linux/Mac: 运行 `bash setup.sh`

**Q: 密钥添加后在哪里使用？**
A: 在画布页面选择对应的模型，系统会自动使用该模型的活跃密钥。

**Q: 可以为一个模型配置多个密钥吗？**
A: 可以。系统会自动选择活跃的密钥，这样可以实现故障转移和负载均衡。

**Q: 配置值为什么必须是JSON格式？**
A: JSON格式易于解析和验证，支持复杂的嵌套结构。

**Q: 如何查看API密钥？**
A: 在API密钥管理界面，点击眼睛图标即可显示/隐藏密钥内容。

---

## ✅ 检查清单

部署后请验证：

- [ ] 模型管理页面可以访问 (`http://localhost:5173/models`)
- [ ] 模型列表正常显示
- [ ] 可以添加API密钥
- [ ] 可以设置模型配置
- [ ] 在生成页面选择模型时会使用该密钥
- [ ] API密钥显示/隐藏功能正常
- [ ] 配额管理正确显示

---

## 📞 技术支持

如有问题，请检查：
1. 后端是否正常运行 (`http://localhost:8000/docs`)
2. 数据库是否初始化
3. API密钥是否有效
4. 浏览器控制台是否有错误

---

**创建时间**: 2025年12月24日  
**完成状态**: ✅ 已完成  
**可用性**: 生产就绪
