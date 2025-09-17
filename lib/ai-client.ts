import { geminiClient, GeminiImageResponse } from './gemini';
import { vertexAIClient, VertexImageResponse } from './vertex-ai';

export interface AIImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface AIEditResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class AIClient {
  private useVertexAI: boolean;
  private forceAIStudio: boolean;

  constructor() {
    // 强制使用 AI Studio 进行图像生成（nano 模型）
    this.forceAIStudio = true;
    this.useVertexAI = false;
    
    console.log(`Using ${this.useVertexAI ? 'Vertex AI' : 'AI Studio'} for image generation`);
    console.log('🔧 Force AI Studio mode enabled for image generation (nano model)');
  }

  async generateImage(prompt: string): Promise<AIImageResponse> {
    if (this.useVertexAI) {
      const result = await vertexAIClient.generateImage(prompt);
      return {
        success: result.success,
        imageUrl: result.imageUrl,
        error: result.error
      };
    } else {
      const result = await geminiClient.generateImage(prompt);
      return {
        success: result.success,
        imageUrl: result.imageUrl,
        error: result.error
      };
    }
  }

  async editImage(prompt: string, imageData: string, mimeType: string = "image/png"): Promise<AIEditResponse> {
    if (this.useVertexAI) {
      const result = await vertexAIClient.editImage(prompt, imageData, mimeType);
      return {
        success: result.success,
        imageUrl: result.imageUrl,
        error: result.error
      };
    } else {
      const result = await geminiClient.editImage(prompt, imageData, mimeType);
      return {
        success: result.success,
        imageUrl: result.imageUrl,
        error: result.error
      };
    }
  }

  async editMultipleImages(prompt: string, images: string[]): Promise<AIEditResponse> {
    if (this.useVertexAI) {
      // Vertex AI 暂不支持多图编辑
      return {
        success: false,
        error: "Vertex AI does not support multiple image editing yet"
      };
    } else {
      const result = await geminiClient.editMultipleImages(prompt, images);
      return {
        success: result.success,
        imageUrl: result.imageUrl,
        error: result.error
      };
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (this.useVertexAI) {
      return await vertexAIClient.generateText(prompt);
    } else {
      return await geminiClient.generateText(prompt);
    }
  }

  getCurrentProvider(): string {
    return this.useVertexAI ? 'Vertex AI' : 'AI Studio';
  }
}

// Export a singleton instance
export const aiClient = new AIClient();
