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
    console.log("🚀 [Imagen-4.0] 开始生成图像");
    console.log(`📝 [Imagen-4.0] 提示词: "${prompt.substring(0, 100)}..."`);
    console.log(`📐 [Imagen-4.0] 宽高比: ${aspectRatio}`);
    
    // 获取可用的 API Key
    const apiKeyManager = getAPIKeyManager();
    const apiKey = apiKeyManager.getCurrentKey();
    
    if (!apiKey) {
      console.log("❌ [Imagen-4.0] 没有可用的 API Key");
      throw new Error('No available API keys');
    }
    
    console.log("🔑 [Imagen-4.0] API Key 获取成功");

    // 初始化 Google GenAI 客户端
    const ai = new GoogleGenAI({ apiKey });
    console.log("🔧 [Imagen-4.0] Google GenAI 客户端初始化完成");

    // 调用 Imagen-4.0 生成图像 (生成 4 张供用户选择)
    console.log("🎨 [Imagen-4.0] 调用 generateImages API...");
    console.log(`🔧 [Imagen-4.0] 模型: imagen-4.0-generate-001`);
    console.log(`🔧 [Imagen-4.0] 生成数量: 4 张图像`);
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 4, // 生成 4 张图像
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    console.log("📥 [Imagen-4.0] API 响应接收成功");

    // 检查响应
    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.log("❌ [Imagen-4.0] 没有生成任何图像");
      throw new Error('No images generated');
    }

    console.log(`✅ [Imagen-4.0] 成功生成 ${response.generatedImages.length} 张图像`);

    // 返回所有生成的图像
    const images = response.generatedImages.map(img => 
      `data:image/jpeg;base64,${img.image.imageBytes}`
    );
    
    console.log("🔄 [Imagen-4.0] 图像数据转换完成");
    
    // 返回第一张图像作为主要显示，其他图像在数组中
    return {
      primary: images[0],
      all: images
    };

  } catch (error) {
    console.error('❌ [Imagen-4.0] 生成失败:', error);
    
    // 标记当前 API Key 为不可用（如果是 API 错误）
    if (error instanceof Error && (
      error.message.includes('quota') || 
      error.message.includes('limit') || 
      error.message.includes('403') ||
      error.message.includes('429')
    )) {
      console.log("⚠️ [Imagen-4.0] API Key 配额问题，标记为失败");
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
