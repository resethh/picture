"""
AI生成服务
支持多个AI模型提供商的API调用
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import random
import httpx
import json
from typing import Dict, Any, Optional


def generate_placeholder_image(save_path: Path, prompt: str = "") -> None:
    """生成占位图片"""
    # 生成随机颜色
    color = (
        random.randint(50, 200),
        random.randint(50, 200),
        random.randint(50, 200)
    )
    
    # 创建图片
    img = Image.new('RGB', (512, 512), color=color)
    draw = ImageDraw.Draw(img)
    
    # 添加文字
    try:
        # 尝试使用系统字体
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    text = f"AI Generated\n{prompt[:30]}"
    
    # 获取文字边界框
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # 居中绘制文字
    position = ((512 - text_width) // 2, (512 - text_height) // 2)
    draw.text(position, text, fill=(255, 255, 255), font=font)
    
    # 保存图片
    img.save(save_path)


class AIImageGenerator:
    """AI图像生成引擎"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def generate_with_openai(
        self,
        api_key: str,
        prompt: str,
        model_name: str = "dall-e-3",
        size: str = "1024x1024",
        quality: str = "standard",
        n: int = 1
    ) -> Dict[str, Any]:
        """
        调用OpenAI DALL-E API生成图片
        https://platform.openai.com/docs/api-reference/images/create
        """
        try:
            response = await self.client.post(
                "https://api.openai.com/v1/images/generations",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model_name,
                    "prompt": prompt,
                    "size": size,
                    "quality": quality,
                    "n": n
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "data": data,
                    "images": [item["url"] for item in data.get("data", [])]
                }
            else:
                return {
                    "success": False,
                    "error": response.text
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_with_stability(
        self,
        api_key: str,
        prompt: str,
        model_id: str = "stable-diffusion-xl-1024-v1-0",
        steps: int = 20,
        cfg_scale: float = 7.0
    ) -> Dict[str, Any]:
        """
        调用Stability AI API生成图片
        https://platform.stability.ai/docs/api-reference
        """
        try:
            response = await self.client.post(
                f"https://api.stability.ai/v1/generation/{model_id}/text-to-image",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "text_prompts": [{"text": prompt, "weight": 1.0}],
                    "steps": steps,
                    "cfg_scale": cfg_scale,
                    "samples": 1
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "data": data,
                    "images": [f"data:image/png;base64,{img['base64']}" for img in data.get("artifacts", [])]
                }
            else:
                return {
                    "success": False,
                    "error": response.text
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_with_huggingface(
        self,
        api_key: str,
        prompt: str,
        model_id: str = "stabilityai/stable-diffusion-2-1"
    ) -> Dict[str, Any]:
        """
        调用Hugging Face推理API生成图片
        https://huggingface.co/docs/api-inference/detailed_parameters
        """
        try:
            response = await self.client.post(
                f"https://api-inference.huggingface.co/models/{model_id}",
                headers={
                    "Authorization": f"Bearer {api_key}"
                },
                content=json.dumps({"inputs": prompt})
            )
            
            if response.status_code == 200:
                # Hugging Face返回二进制图片数据
                return {
                    "success": True,
                    "data": {"image_data": response.content},
                    "images": [f"data:image/png;base64,{response.text}"]
                }
            else:
                return {
                    "success": False,
                    "error": response.text
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_image(
        self,
        provider_name: str,
        model_name: str,
        prompt: str,
        api_key: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        根据提供商和模型名称生成图片
        
        Args:
            provider_name: 提供商名称 (openai, stability, huggingface, local)
            model_name: 具体模型名称
            prompt: 生成提示词
            api_key: API密钥
            **kwargs: 其他参数
        """
        if provider_name.lower() == "openai":
            return await self.generate_with_openai(
                api_key=api_key,
                prompt=prompt,
                model_name=model_name,
                **kwargs
            )
        elif provider_name.lower() == "stability":
            return await self.generate_with_stability(
                api_key=api_key,
                prompt=prompt,
                model_id=model_name,
                **kwargs
            )
        elif provider_name.lower() == "huggingface":
            return await self.generate_with_huggingface(
                api_key=api_key,
                prompt=prompt,
                model_id=model_name,
                **kwargs
            )
        else:
            return {
                "success": False,
                "error": f"不支持的提供商: {provider_name}"
            }
    
    async def close(self):
        """关闭HTTP客户端"""
        await self.client.aclose()

