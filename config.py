"""
配置管理模块
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    
    # Cursor API配置
    cursor_api_url: str = "https://api2.cursor.sh"
    cursor_api_key: str = ""
    
    # 服务器配置
    server_host: str = "0.0.0.0"
    server_port: int = 8000
    server_workers: int = 4
    
    # 安全配置
    enable_auth: bool = False
    auth_token: str = ""
    
    # 日志配置
    log_level: str = "INFO"
    log_file: str = "logs/proxy.log"
    
    # 限流配置
    rate_limit: int = 60
    
    # 超时配置（秒）
    request_timeout: int = 300
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# 全局配置实例
settings = Settings()
