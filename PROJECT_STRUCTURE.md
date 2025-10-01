# 项目结构说明

## 文件目录结构

```
cursor-api-proxy/
├── main.py                 # 主应用程序（FastAPI服务器）
├── config.py               # 配置管理模块
├── requirements.txt        # Python依赖列表
├── .env.example           # 环境变量配置示例
├── .env                   # 环境变量配置（需自行创建）
├── .gitignore            # Git忽略文件配置
│
├── static/               # 前端静态文件目录
│   ├── index.html       # Web聊天界面主页
│   ├── style.css        # 样式文件
│   └── app.js          # 前端JavaScript逻辑
│
├── logs/                # 日志文件目录（自动创建）
│   └── proxy.log       # 应用日志
│
├── start.sh            # 开发环境启动脚本
├── start_prod.sh       # 生产环境启动脚本
├── test_proxy.py       # 测试脚本
│
├── Dockerfile          # Docker镜像配置
├── docker-compose.yml  # Docker Compose配置
│
├── README.md           # 完整项目文档
├── QUICKSTART.md       # 快速开始指南
└── PROJECT_STRUCTURE.md # 本文件
```

## 核心文件说明

### 后端文件

#### `main.py`
主应用程序文件，包含：
- FastAPI应用初始化
- 所有API端点定义
- 请求转发逻辑
- 静态文件服务配置
- 日志配置

**主要端点：**
- `GET /` - Web聊天界面
- `GET /health` - 健康检查
- `GET /models` - 获取模型列表
- `POST /chat` - 聊天对话
- `{METHOD} /api/{path}` - API透明转发

#### `config.py`
配置管理模块，使用Pydantic Settings：
- 从环境变量加载配置
- 提供配置验证
- 全局配置实例

**配置项：**
- Cursor API配置（URL、密钥）
- 服务器配置（主机、端口、Workers）
- 安全配置（认证开关、Token）
- 日志配置
- 限流配置

### 前端文件

#### `static/index.html`
Web聊天界面的HTML结构：
- 侧边栏（模型选择、历史记录）
- 主聊天区域
- 输入区域
- 响应式布局

#### `static/style.css`
完整的样式定义：
- 深色/浅色主题支持
- 响应式设计
- 动画效果
- 消息气泡样式
- 移动端适配

#### `static/app.js`
前端核心逻辑：
- 状态管理（AppState）
- API调用（fetch）
- UI更新函数
- Markdown渲染
- 代码高亮
- LocalStorage持久化
- 对话历史管理

### 配置文件

#### `.env.example`
环境变量配置模板，包含所有可配置项及说明。

#### `requirements.txt`
Python依赖包列表：
- fastapi - Web框架
- uvicorn - ASGI服务器
- httpx - HTTP客户端
- pydantic - 数据验证
- loguru - 日志库
- slowapi - 速率限制

### 部署文件

#### `Dockerfile`
Docker镜像构建配置：
- 基于Python 3.11-slim
- 安装依赖
- 暴露8000端口
- 配置启动命令

#### `docker-compose.yml`
Docker Compose配置：
- 服务定义
- 端口映射
- 环境变量
- 卷挂载（日志持久化）
- 网络配置

#### `start.sh`
开发环境启动脚本：
- 单进程模式
- 适合开发和调试
- 直接使用Python运行

#### `start_prod.sh`
生产环境启动脚本：
- 多Worker模式
- 使用Uvicorn运行
- 读取环境变量配置

### 测试文件

#### `test_proxy.py`
功能测试脚本：
- 测试根路径
- 测试健康检查
- 测试API转发
- 支持命令行参数

## 数据流

### 1. Web聊天界面流程

```
用户浏览器
    ↓ (访问 http://localhost:8000)
FastAPI Static Files
    ↓ (返回 index.html + CSS + JS)
用户浏览器
    ↓ (发送聊天请求到 POST /chat)
FastAPI Chat Endpoint
    ↓ (转发到 Cursor API)
Cursor API Server
    ↓ (返回AI响应)
FastAPI
    ↓ (返回给前端)
用户浏览器
    ↓ (渲染Markdown并显示)
```

### 2. 直接API调用流程

```
客户端应用
    ↓ (POST /api/v1/chat/completions)
FastAPI Proxy Endpoint
    ↓ (添加API Key，转发请求)
Cursor API Server
    ↓ (处理并返回)
FastAPI
    ↓ (透明返回响应)
客户端应用
```

## 技术架构

### 后端架构
- **框架层**: FastAPI
- **ASGI服务器**: Uvicorn
- **HTTP客户端**: httpx（异步）
- **配置管理**: Pydantic Settings
- **日志系统**: Loguru
- **限流**: SlowAPI

### 前端架构
- **UI渲染**: 原生JavaScript + DOM操作
- **Markdown**: Marked.js
- **代码高亮**: Highlight.js
- **状态管理**: 自定义AppState对象
- **持久化**: LocalStorage
- **样式**: 原生CSS（CSS变量主题切换）

## 扩展点

如果需要扩展功能，可以在以下位置添加：

### 添加新的API端点
在 `main.py` 中添加新的路由函数：
```python
@app.get("/new-endpoint")
async def new_endpoint():
    return {"message": "New endpoint"}
```

### 添加新的AI模型
在 `main.py` 的 `get_available_models()` 函数中添加：
```python
{
    "id": "new-model-id",
    "name": "New Model",
    "provider": "Provider Name",
    "description": "Model description"
}
```

### 自定义前端样式
编辑 `static/style.css`，修改CSS变量：
```css
:root {
    --accent-color: #your-color;
}
```

### 添加新的前端功能
在 `static/app.js` 中扩展 `app` 对象：
```javascript
const app = {
    // ... existing methods
    newFeature() {
        // Your code here
    }
};
```

## 安全考虑

- ✅ API密钥存储在服务器端，前端不可见
- ✅ 可选的认证机制保护API端点
- ✅ 速率限制防止滥用
- ✅ CORS配置控制跨域访问
- ✅ 完整的请求日志用于审计

## 性能特性

- ⚡ 异步请求处理（httpx + FastAPI）
- ⚡ 静态文件缓存
- ⚡ 前端LocalStorage减少服务器负载
- ⚡ 多Worker支持（生产模式）
- ⚡ 连接池复用

## 维护建议

1. **定期查看日志**: `tail -f logs/proxy.log`
2. **监控磁盘空间**: 日志文件自动轮转（500MB）
3. **更新依赖**: `pip install -U -r requirements.txt`
4. **备份配置**: 定期备份 `.env` 文件
5. **清理历史**: 浏览器LocalStorage可能需要定期清理
