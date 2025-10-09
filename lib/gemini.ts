import { GoogleGenAI, Modality } from "@google/genai";
import { getAPIKeyManager } from "./api-key-manager";

export interface GeminiImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface GeminiEditResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class GeminiClient {
  private client: GoogleGenAI;

  constructor() {
    // 先尝试使用环境变量，如果没有则使用 API Key 管理器
    const envApiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (envApiKey) {
      this.client = new GoogleGenAI({ apiKey: envApiKey });
    } else {
      try {
        const apiKeyManager = getAPIKeyManager();
        const apiKey = apiKeyManager.getCurrentKey();
        this.client = new GoogleGenAI({ apiKey });
      } catch (error) {
        throw new Error("API Key 管理器未初始化，请先调用 initializeAPIKeyManager");
      }
    }
  }

  async generateImage(prompt: string, aspectRatio: string = "1:1"): Promise<GeminiImageResponse> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 尝试生成图像 (第 ${attempt}/${maxRetries} 次)`);
        
        // 每次尝试都重新创建客户端以使用新的 API Key
        const apiKeyManager = getAPIKeyManager();
        const apiKey = apiKeyManager.getCurrentKey();
        this.client = new GoogleGenAI({ apiKey });
        
        // 使用正式版模型，添加image-only输出配置
        // 简化prompt增强，避免过于复杂的指令
        const enhancedPrompt = aspectRatio !== "16:9" ? `${prompt} (${aspectRatio} ratio)` : prompt;
        
        const response = await this.client.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: { parts: [{ text: enhancedPrompt }] },
          config: {
            responseModalities: ["IMAGE"]
          }
        });

        console.log("Gemini response received");

        // 使用官方推荐的响应处理方式
        return this.handleApiResponse(response, 'image generation');
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ 第 ${attempt} 次尝试失败:`, error);
        
        // 检查是否是配额或认证错误
        if (error instanceof Error && (
          error.message.includes('quota') || 
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.includes('UNAUTHENTICATED') ||
          error.message.includes('PERMISSION_DENIED')
        )) {
          console.log("🔄 检测到配额或认证错误，切换到下一个 API Key");
          const apiKeyManager = getAPIKeyManager();
          apiKeyManager.markCurrentKeyFailed();
          
          // 如果还有可用的 Key，继续尝试
          if (apiKeyManager.getAvailableKeys().length > 0) {
            continue;
          } else {
            console.log("❌ 所有 API Key 都已失效");
            break;
          }
        }
        
        // 如果不是配额错误，直接返回错误
        if (attempt === maxRetries) {
          break;
        }
      }
    }

    console.error("❌ 所有尝试都失败了");
    return {
      success: false,
      error: lastError?.message || "Unknown error occurred"
    };
  }

  // 基于官方示例的响应处理方法
  private handleApiResponse(response: any, context: string): GeminiImageResponse {
    // 1. 检查 prompt 是否被阻止
    if (response.promptFeedback?.blockReason) {
      const { blockReason, blockReasonMessage } = response.promptFeedback;
      const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
      console.error(errorMessage, { response });
      return { success: false, error: errorMessage };
    }

    // 2. 查找图像数据
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
      const { mimeType, data } = imagePartFromResponse.inlineData;
      console.log(`✅ 成功接收图像数据 (${mimeType}) for ${context}`);
      return {
        success: true,
        imageUrl: `data:${mimeType};base64,${data}`
      };
    }

    // 3. 如果没有图像，检查其他原因
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
      console.error(errorMessage, { response });
      return { success: false, error: errorMessage };
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    return { success: false, error: errorMessage };
  }

  async editImage(prompt: string, imageData: string, mimeType: string = "image/png", aspectRatio: string = "16:9"): Promise<GeminiEditResponse> {
    try {
      console.log("Editing single image with prompt:", prompt);
      
      // 简化prompt增强，避免过于复杂的指令
      const enhancedPrompt = aspectRatio !== "16:9" ? `${prompt} (${aspectRatio} ratio)` : prompt;
      
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageData,
              },
            },
            { text: enhancedPrompt },
          ],
        },
        // 移除过于严格的responseModalities配置，让模型自然选择输出类型
        // config: {
        //   responseModalities: ["IMAGE"]
        // },
      });

      console.log("Gemini single image edit response received");

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from Gemini");
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error("No content parts returned from Gemini");
      }

      // 查找图片和文本数据
      let generatedImage: string | null = null;
      let generatedText: string | null = null;

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          generatedImage = `data:${mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
          generatedText = part.text;
        }
      }

      if (!generatedImage) {
        throw new Error("The model did not return an image. It may have refused the request.");
      }

      console.log("✅ Successfully edited single image");
      
      return {
        success: true,
        imageUrl: generatedImage
      };
      
    } catch (error) {
      console.error("Error editing image:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  async editMultipleImages(prompt: string, images: string[], aspectRatio: string = "16:9"): Promise<GeminiEditResponse> {
    try {
      console.log(`Generating image with ${images.length} reference images`);
      
      // 简化prompt增强，避免过于复杂的指令
      const enhancedPrompt = aspectRatio !== "16:9" ? `${prompt} (${aspectRatio} ratio)` : prompt;
      
      // 根据官方文档，最多支持15张图片（16个part - 1个文本part）
      const MAX_IMAGES = 15;
      if (images.length > MAX_IMAGES) {
        console.warn(`Too many images (${images.length}), limiting to ${MAX_IMAGES} images`);
        images = images.slice(0, MAX_IMAGES);
      }
      
      // 构建图片parts
      const imageParts = images.map((imageDataUrl, index) => {
        const base64Data = imageDataUrl.split(',')[1];
        const mimeType = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
        
        console.log(`Processing reference image ${index + 1}/${images.length} (${mimeType})`);
        
        return {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        };
      });

      // 构建文本part
      const textPart = { text: enhancedPrompt };

      // 使用正式版模型，添加image-only输出配置
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [...imageParts, textPart],
        },
        // 移除过于严格的responseModalities配置，让模型自然选择输出类型
        // config: {
        //   responseModalities: ["IMAGE"]
        // },
      });
      
      console.log("Gemini multi-image generation response received");

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from Gemini");
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error("No content parts returned from Gemini");
      }

      // 查找图片和文本数据
      let generatedImage: string | null = null;
      let generatedText: string | null = null;

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          generatedImage = `data:${mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
          generatedText = part.text;
        }
      }

      if (!generatedImage) {
        throw new Error("The model did not return an image. It may have refused the request.");
      }

      console.log(`✅ Successfully generated image from ${images.length} reference images`);
      
      return {
        success: true,
        imageUrl: generatedImage
      };
      
    } catch (error) {
      console.error("Error editing multiple images:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: prompt,
        config: {
          responseModalities: ["TEXT"] // 文本生成使用TEXT模式
        }
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from Gemini");
      }

      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        throw new Error("No content parts returned from Gemini");
      }

      const textParts = candidate.content.parts.filter(part => part.text);
      return textParts.map(p => p.text).join(" ");
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const geminiClient = new GeminiClient();
