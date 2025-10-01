"""
Cursor API 转发代理服务器
"""
import httpx
from fastapi import FastAPI, Request, Response, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Optional
import logging
from loguru import logger
import sys
import os

from config import settings

# 创建必要目录
os.makedirs("logs", exist_ok=True)
os.makedirs("static", exist_ok=True)

# 配置loguru
logger.remove()
logger.add(sys.stderr, level=settings.log_level)
logger.add(
    settings.log_file,
    rotation="500 MB",
    retention="10 days",
    level=settings.log_level,
    encoding="utf-8"
)

# 创建FastAPI应用
app = FastAPI(
    title="Cursor API Proxy",
    description="局域网内Cursor API请求转发服务器",
    version="1.0.0",
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 限流配置
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# HTTP客户端
http_client = httpx.AsyncClient(timeout=settings.request_timeout)


async def verify_auth(authorization: Optional[str] = Header(None)):
    """验证请求认证"""
    if not settings.enable_auth:
        return True
    
    if not authorization:
        raise HTTPException(status_code=401, detail="未提供认证信息")
    
    # 支持 Bearer token
    token = authorization.replace("Bearer ", "")
    if token != settings.auth_token:
        raise HTTPException(status_code=401, detail="认证失败")
    
    return True


@app.get("/api-info")
async def api_info():
    """API信息"""
    return {
        "service": "Cursor API Proxy",
        "version": "1.0.0",
        "status": "running",
        "cursor_api": settings.cursor_api_url
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "cursor_api_configured": bool(settings.cursor_api_key)
    }


@app.get("/models")
async def get_available_models():
    """获取可用的AI模型列表"""
    return {
        "models": [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "OpenAI",
                "description": "最强大的GPT-4模型"
            },
            {
                "id": "gpt-4-turbo",
                "name": "GPT-4 Turbo",
                "provider": "OpenAI",
                "description": "更快的GPT-4版本"
            },
            {
                "id": "gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo",
                "provider": "OpenAI",
                "description": "快速且经济的模型"
            },
            {
                "id": "claude-3-5-sonnet-20241022",
                "name": "Claude 3.5 Sonnet",
                "provider": "Anthropic",
                "description": "最新的Claude模型"
            },
            {
                "id": "claude-3-opus-20240229",
                "name": "Claude 3 Opus",
                "provider": "Anthropic",
                "description": "Claude最强大的模型"
            },
            {
                "id": "claude-3-sonnet-20240229",
                "name": "Claude 3 Sonnet",
                "provider": "Anthropic",
                "description": "平衡性能和成本"
            }
        ]
    }


@app.post("/chat")
@limiter.limit(f"{settings.rate_limit}/minute")
async def chat_completion(
    request: Request,
    _: bool = Depends(verify_auth)
):
    """
    聊天对话端点
    
    请求体示例:
    {
        "model": "gpt-4",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": false
    }
    """
    try:
        body = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"无效的JSON: {str(e)}")
    
    # 验证必需字段
    if "messages" not in body:
        raise HTTPException(status_code=400, detail="缺少 messages 字段")
    
    # 设置默认模型
    if "model" not in body:
        body["model"] = "gpt-4"
    
    # 构建目标URL
    target_url = f"{settings.cursor_api_url}/v1/chat/completions"
    
    # 准备请求头
    headers = {
        "Content-Type": "application/json",
        "authorization": f"Bearer {settings.cursor_api_key}"
    }
    
    logger.info(
        f"聊天请求: model={body.get('model')} "
        f"来自: {request.client.host if request.client else 'unknown'}"
    )
    
    try:
        # 转发请求
        response = await http_client.post(
            url=target_url,
            json=body,
            headers=headers,
        )
        
        logger.info(f"聊天响应: {response.status_code}")
        
        # 返回响应
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers={"Content-Type": "application/json"},
        )
        
    except httpx.TimeoutException:
        logger.error(f"聊天请求超时")
        raise HTTPException(status_code=504, detail="请求超时")
    
    except httpx.RequestError as e:
        logger.error(f"聊天请求错误: {str(e)}")
        raise HTTPException(status_code=502, detail=f"请求失败: {str(e)}")
    
    except Exception as e:
        logger.error(f"聊天未知错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器错误: {str(e)}")


@app.api_route(
    "/api/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
)
@limiter.limit(f"{settings.rate_limit}/minute")
async def proxy_cursor_api(
    path: str,
    request: Request,
    _: bool = Depends(verify_auth)
):
    """
    转发请求到Cursor API
    
    所有发送到 /api/* 的请求都会被转发到 Cursor API
    """
    # 构建目标URL
    target_url = f"{settings.cursor_api_url}/{path}"
    
    # 获取原始请求体
    body = await request.body()
    
    # 准备请求头
    headers = dict(request.headers)
    
    # 移除可能引起问题的头
    headers.pop("host", None)
    headers.pop("content-length", None)
    
    # 添加Cursor API Key
    if settings.cursor_api_key:
        headers["authorization"] = f"Bearer {settings.cursor_api_key}"
    
    # 获取查询参数
    query_params = dict(request.query_params)
    
    logger.info(
        f"转发请求: {request.method} {target_url} "
        f"来自: {request.client.host if request.client else 'unknown'}"
    )
    
    try:
        # 转发请求
        response = await http_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body,
            params=query_params,
            follow_redirects=True,
        )
        
        # 准备响应头
        response_headers = dict(response.headers)
        
        # 移除可能引起问题的响应头
        response_headers.pop("content-encoding", None)
        response_headers.pop("transfer-encoding", None)
        
        logger.info(
            f"响应: {response.status_code} {request.method} {target_url}"
        )
        
        # 返回响应
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
        )
        
    except httpx.TimeoutException:
        logger.error(f"请求超时: {target_url}")
        raise HTTPException(status_code=504, detail="请求超时")
    
    except httpx.RequestError as e:
        logger.error(f"请求错误: {target_url} - {str(e)}")
        raise HTTPException(status_code=502, detail=f"转发请求失败: {str(e)}")
    
    except Exception as e:
        logger.error(f"未知错误: {target_url} - {str(e)}")
        raise HTTPException(status_code=500, detail=f"服务器内部错误: {str(e)}")


@app.on_event("shutdown")
async def shutdown_event():
    """关闭时清理资源"""
    await http_client.aclose()
    logger.info("服务器已关闭")


# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")


# 主页路由 - 返回Web界面
@app.get("/")
async def serve_home():
    """返回Web聊天界面"""
    index_path = "static/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        return {
            "message": "Web界面尚未部署",
            "api_docs": "/docs",
            "health_check": "/health"
        }


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"启动服务器 {settings.server_host}:{settings.server_port}")
    logger.info(f"目标API: {settings.cursor_api_url}")
    logger.info(f"认证: {'启用' if settings.enable_auth else '禁用'}")
    logger.info(f"限流: {settings.rate_limit} 请求/分钟")
    
    uvicorn.run(
        app,
        host=settings.server_host,
        port=settings.server_port,
        log_level=settings.log_level.lower(),
    )
