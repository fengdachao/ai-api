"""
测试脚本 - 测试代理服务器功能
"""
import requests
import json
import sys


def test_proxy(proxy_url: str = "http://localhost:8000", auth_token: str = None):
    """测试代理服务器"""
    
    print(f"测试代理服务器: {proxy_url}")
    print("=" * 60)
    
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    # 1. 测试根路径
    print("\n1. 测试根路径 /")
    try:
        response = requests.get(f"{proxy_url}/", headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"错误: {e}")
    
    # 2. 测试健康检查
    print("\n2. 测试健康检查 /health")
    try:
        response = requests.get(f"{proxy_url}/health", headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"错误: {e}")
    
    # 3. 测试API转发（示例）
    print("\n3. 测试API转发 /api/...")
    print("注意: 这需要配置有效的 CURSOR_API_KEY")
    
    # 示例请求体（根据Cursor API实际需求调整）
    test_data = {
        "model": "gpt-4",
        "messages": [{"role": "user", "content": "Hello"}]
    }
    
    try:
        response = requests.post(
            f"{proxy_url}/api/v1/chat/completions",
            headers={**headers, "Content-Type": "application/json"},
            json=test_data
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print(f"响应: {response.text[:200]}...")
        else:
            print(f"响应: {response.text}")
    except Exception as e:
        print(f"错误: {e}")
    
    print("\n" + "=" * 60)
    print("测试完成")


if __name__ == "__main__":
    # 从命令行参数获取代理URL和认证token
    proxy_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    auth_token = sys.argv[2] if len(sys.argv) > 2 else None
    
    test_proxy(proxy_url, auth_token)
