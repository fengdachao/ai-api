# Cursor API 代理服务器 + Web聊天界面

<div align="center">

**🚀 一个高性能的RESTful代理服务器 + 现代化Web聊天界面**

*用于在局域网内访问和调用Cursor API服务*

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[快速开始](#快速开始) • [功能特性](#功能特性) • [文档](#文档目录) • [演示](#使用方法)

</div>

---

## 📖 项目简介

一个集成了**RESTful API代理**和**Web聊天界面**的完整解决方案，支持在局域网内部署，为团队提供统一的AI对话服务。

## 功能特性

✨ **核心功能**
- 🚀 高性能异步请求转发
- 💬 精美的Web聊天界面（无需额外部署）
- 🤖 多AI模型支持（GPT-4、Claude等）
- 🔄 支持所有HTTP方法（GET, POST, PUT, DELETE, PATCH等）
- 📝 完整的请求/响应日志记录
- 🔐 可选的内部认证机制
- ⚡ 请求速率限制
- 🌐 CORS支持
- 📊 健康检查端点
- 🎯 自动API文档（Swagger UI）
- 🌓 深色/浅色主题切换
- 💾 本地对话历史保存
- 📱 响应式设计，支持移动端

## 快速开始

### 1. 环境要求

- Python 3.8+
- pip

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

复制示例配置文件并编辑：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```bash
# Cursor API配置
CURSOR_API_URL=https://api2.cursor.sh
CURSOR_API_KEY=your_cursor_api_key_here

# 服务器配置
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
SERVER_WORKERS=4

# 安全配置（可选）
ENABLE_AUTH=false
AUTH_TOKEN=your_secret_token_here

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/proxy.log

# 限流配置（每分钟请求数）
RATE_LIMIT=60
```

### 4. 启动服务器

**开发模式（单进程）：**
```bash
chmod +x start.sh
./start.sh
```

或直接运行：
```bash
python main.py
```

**生产模式（多worker）：**
```bash
chmod +x start_prod.sh
./start_prod.sh
```

服务器将在 `http://0.0.0.0:8000` 启动。

## 使用方法

### 🌐 Web聊天界面（推荐）

启动服务器后，直接在浏览器访问：

```
http://localhost:8000
```

或在局域网内其他设备上访问：

```
http://your-server-ip:8000
```

**Web界面功能：**
- ✅ 选择不同的AI模型（GPT-4、Claude等）
- ✅ 实时AI对话，支持Markdown和代码高亮
- ✅ 保存和管理对话历史
- ✅ 深色/浅色主题切换
- ✅ 响应式设计，手机也能用

### 📡 API端点

#### 1. 根路径 / Web界面
```bash
GET /
```
返回Web聊天界面。

#### 2. API信息
```bash
GET /api-info
```
返回服务基本信息。

#### 3. 健康检查
```bash
GET /health
```
检查服务健康状态。

#### 4. 获取模型列表
```bash
GET /models
```
获取所有可用的AI模型列表。

#### 5. 聊天对话
```bash
POST /chat
```
发送聊天消息。

**请求示例：**
```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}
```

#### 6. API转发（高级）
```bash
{METHOD} /api/{path}
```
将请求直接转发到 Cursor API。

**示例：**

```bash
# 转发聊天请求
curl -X POST http://localhost:8000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

如果启用了认证，需要添加认证头：

```bash
curl -X POST http://localhost:8000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_secret_token_here" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 局域网访问

服务器默认绑定到 `0.0.0.0`，局域网内的其他设备可以通过服务器IP访问：

```bash
# 假设服务器IP为 192.168.1.100
curl http://192.168.1.100:8000/health
```

### 自动API文档

启动服务器后，访问以下URL查看自动生成的API文档：

- **Web聊天界面**: `http://localhost:8000/` （主界面）
- **Swagger UI**: `http://localhost:8000/docs` （API文档）
- **ReDoc**: `http://localhost:8000/redoc` （备用文档）

## 模型选择说明

Web界面和API都支持选择不同的AI模型：

### 可用模型

| 模型ID | 名称 | 提供商 | 特点 |
|--------|------|--------|------|
| `gpt-4` | GPT-4 | OpenAI | 最强大的推理能力 |
| `gpt-4-turbo` | GPT-4 Turbo | OpenAI | 更快更经济 |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | OpenAI | 快速响应，适合简单任务 |
| `claude-3-5-sonnet-20241022` | Claude 3.5 Sonnet | Anthropic | 最新Claude模型 |
| `claude-3-opus-20240229` | Claude 3 Opus | Anthropic | Claude最强版本 |
| `claude-3-sonnet-20240229` | Claude 3 Sonnet | Anthropic | 平衡性能 |

### 如何选择模型

**在Web界面中：**
- 使用左侧边栏的"模型选择"下拉菜单
- 选择后立即生效，影响后续所有对话

**在API调用中：**
```json
{
  "model": "claude-3-5-sonnet-20241022",  // 指定模型
  "messages": [...]
}
```

**注意事项：**
- 不同模型的响应速度和质量可能不同
- 某些模型可能需要特定的API权限
- 模型可用性取决于您的Cursor API配置

## 测试

运行测试脚本：

```bash
# 测试本地服务器
python test_proxy.py

# 测试指定服务器
python test_proxy.py http://192.168.1.100:8000

# 测试启用认证的服务器
python test_proxy.py http://192.168.1.100:8000 your_secret_token
```

## 配置说明

### 环境变量详解

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `CURSOR_API_URL` | Cursor API服务地址 | `https://api2.cursor.sh` |
| `CURSOR_API_KEY` | Cursor API密钥 | - |
| `SERVER_HOST` | 服务器监听地址 | `0.0.0.0` |
| `SERVER_PORT` | 服务器端口 | `8000` |
| `SERVER_WORKERS` | Worker进程数（生产模式） | `4` |
| `ENABLE_AUTH` | 是否启用内部认证 | `false` |
| `AUTH_TOKEN` | 内部认证token | - |
| `LOG_LEVEL` | 日志级别 | `INFO` |
| `LOG_FILE` | 日志文件路径 | `logs/proxy.log` |
| `RATE_LIMIT` | 速率限制（请求/分钟） | `60` |

### 安全建议

1. **生产环境必须启用认证**：设置 `ENABLE_AUTH=true` 并配置强密码
2. **使用HTTPS**：建议在生产环境中使用Nginx反向代理并配置SSL
3. **调整速率限制**：根据实际需求调整 `RATE_LIMIT`
4. **定期更换密钥**：定期更换 `AUTH_TOKEN` 和 `CURSOR_API_KEY`
5. **网络隔离**：确保服务器只在可信的局域网内访问

## 高级配置

### 使用Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

### 使用systemd管理服务

创建 `/etc/systemd/system/cursor-proxy.service`：

```ini
[Unit]
Description=Cursor API Proxy Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/workspace
Environment="PATH=/usr/bin"
ExecStart=/usr/bin/python3 /path/to/workspace/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable cursor-proxy
sudo systemctl start cursor-proxy
sudo systemctl status cursor-proxy
```

## 日志

日志文件位置：`logs/proxy.log`

日志包含：
- 请求信息（方法、URL、来源IP）
- 响应状态码
- 错误信息
- 系统事件

查看实时日志：
```bash
tail -f logs/proxy.log
```

## 故障排除

### 1. 服务无法启动

- 检查端口是否被占用：`lsof -i :8000`
- 检查 `.env` 文件是否存在
- 检查Python依赖是否完整安装

### 2. 请求转发失败

- 检查 `CURSOR_API_KEY` 是否正确配置
- 检查目标API地址是否可访问
- 查看日志文件获取详细错误信息

### 3. 速率限制问题

- 调整 `RATE_LIMIT` 参数
- 检查是否有多个客户端共享同一IP

### 4. 超时错误

- 增加 `REQUEST_TIMEOUT` 配置（在config.py中）
- 检查网络连接稳定性

## 性能优化

1. **调整Worker数量**：根据CPU核心数设置 `SERVER_WORKERS`
2. **使用缓存**：对于重复请求可考虑添加缓存层
3. **连接池**：httpx默认使用连接池，可根据需要调整
4. **日志异步写入**：loguru已配置异步写入

## 技术栈

### 后端
- **FastAPI**: 现代化高性能Web框架
- **Uvicorn**: ASGI服务器
- **httpx**: 异步HTTP客户端
- **Pydantic**: 数据验证和配置管理
- **Loguru**: 强大的日志库
- **SlowAPI**: 速率限制

### 前端
- **纯JavaScript**: 无构建依赖，轻量高效
- **Marked.js**: Markdown渲染
- **Highlight.js**: 代码语法高亮
- **LocalStorage**: 本地数据持久化
- **响应式CSS**: 自适应各种设备

## 文档目录

本项目提供完整的文档支持：

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目主文档（本文件） |
| [QUICKSTART.md](QUICKSTART.md) | 5分钟快速开始指南 |
| [FEATURES.md](FEATURES.md) | 详细功能特性说明 |
| [DEMO_GUIDE.md](DEMO_GUIDE.md) | 19个演示场景 |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | 项目架构和文件说明 |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | 实施总结报告 |
| [VERSION.md](VERSION.md) | 版本信息 |
| [DELIVERY_CHECKLIST.md](DELIVERY_CHECKLIST.md) | 交付清单 |

## 常见问题

### Q: 如何指定使用的AI模型？
**A:** 有两种方式：
1. **Web界面**：左侧边栏的"模型选择"下拉菜单
2. **API调用**：在请求body中指定 `"model": "gpt-4"` 或其他支持的模型ID

支持的模型：GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet

### Q: 局域网内其他设备如何访问？
**A:** 
1. 查看服务器IP地址：`ifconfig` (Linux/Mac) 或 `ipconfig` (Windows)
2. 其他设备浏览器访问：`http://服务器IP:8000`
3. 确保防火墙允许8000端口访问

### Q: 如何保护API安全？
**A:** 
1. 在 `.env` 中设置 `ENABLE_AUTH=true`
2. 配置 `AUTH_TOKEN=your-secret-token`
3. 建议生产环境使用Nginx配置HTTPS

### Q: 对话历史存储在哪里？
**A:** 对话历史存储在浏览器的LocalStorage中，每个设备独立保存，最多保存50条记录。

### Q: 是否支持流式响应？
**A:** 当前版本（v1.0.0）暂不支持流式响应，计划在v1.1.0中添加。

## 更新日志

### v1.0.0 (2025-10-01)
- 🎉 初始版本发布
- ✅ RESTful API代理服务器
- ✅ Web聊天界面
- ✅ 6种AI模型支持
- ✅ 局域网访问
- ✅ 完整文档

详见 [VERSION.md](VERSION.md)

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

如果这个项目对您有帮助，请给个⭐️Star支持一下！

## 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化Web框架
- [Marked.js](https://marked.js.org/) - Markdown渲染
- [Highlight.js](https://highlightjs.org/) - 代码高亮

## 联系方式

如有问题，请通过Issue联系。

---

<div align="center">

**Made with ❤️ for AI Enthusiasts**

⭐️ 如果觉得有用，请给个Star！⭐️

</div>
