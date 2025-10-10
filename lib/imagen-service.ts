import { GoogleGenAI } from "@google/genai";
import { getAPIKeyManager } from './api-key-manager';

/**
 * 使用 Imagen-4.0 生成图像
 * @param prompt 文本提示词
 * @param aspectRatio 宽高比
 * @returns 生成的图像数据，包含主要图像和所有图像
 */
export async function generateImageWithImagen(prompt: string, aspectRatio: string = "16:9"): Promise<{ primary: string; all: string[] }> {
  try {
    // 获取可用的 API Key
    const apiKeyManager = getAPIKeyManager();
    const apiKey = apiKeyManager.getCurrentKey();
    
    if (!apiKey) {
      throw new Error('No available API keys');
    }

    // 初始化 Google GenAI 客户端
    const ai = new GoogleGenAI({ apiKey });

    // 调用 Imagen-4.0 生成图像 (生成 4 张供用户选择)
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 4, // 生成 4 张图像
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    // 检查响应
    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('No images generated');
    }

    // 返回所有生成的图像
    const images = response.generatedImages.map(img => 
      `data:image/jpeg;base64,${img.image.imageBytes}`
    );
    
    // 返回第一张图像作为主要显示，其他图像在数组中
    return {
      primary: images[0],
      all: images
    };

  } catch (error) {
    console.error('Error generating image with Imagen-4.0:', error);
    
    // 标记当前 API Key 为不可用（如果是 API 错误）
    if (error instanceof Error && (
      error.message.includes('quota') || 
      error.message.includes('limit') || 
      error.message.includes('403') ||
      error.message.includes('429')
    )) {
      const apiKeyManager = getAPIKeyManager();
      apiKeyManager.markCurrentKeyFailed();
    }
    
    throw error;
  }
}

/**
 * 支持的宽高比配置
 */
export const IMAGEN_ASPECT_RATIOS = [
  { label: '21:9', value: '21:9' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
  { label: '3:2', value: '3:2' },
  { label: '1:1', value: '1:1' },
  { label: '9:16', value: '9:16' },
  { label: '3:4', value: '3:4' },
  { label: '2:3', value: '2:3' },
  { label: '5:4', value: '5:4' },
  { label: '4:5', value: '4:5' },
];
