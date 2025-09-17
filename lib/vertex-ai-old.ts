import { PredictionServiceClient } from '@google-cloud/aiplatform';
import { protobuf } from '@google-cloud/aiplatform/build/src/protos/protos';

export interface VertexImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface VertexEditResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class VertexAIClient {
  private client: PredictionServiceClient;
  private projectId: string;
  private location: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'artisan-ai-471601';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    this.client = new PredictionServiceClient({
      apiEndpoint: `${this.location}-aiplatform.googleapis.com`,
      // Service Account authentication will be handled automatically via GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  async generateImage(prompt: string): Promise<VertexImageResponse> {
    try {
      console.log("Generating image with Vertex AI, prompt:", prompt);
      
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-2.5-flash`;
      
      const instance = {
        prompt: prompt,
      };

      const request = {
        endpoint,
        instances: [instance],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      const [response] = await this.client.predict(request);
      
      console.log("Vertex AI response:", JSON.stringify(response, null, 2));

      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = response.predictions[0];
      
      // Handle image generation response
      if (prediction.content) {
        // For image generation, the response might be in different formats
        // This is a simplified version - you may need to adjust based on actual response format
        const content = prediction.content as any;
        
        if (content.bytesBase64Encoded) {
          const imageData = content.bytesBase64Encoded;
          const dataUrl = `data:image/png;base64,${imageData}`;
          
          return {
            success: true,
            imageUrl: dataUrl
          };
        }
      }

      throw new Error("No image data found in Vertex AI response");
    } catch (error) {
      console.error("Error generating image with Vertex AI:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  async editImage(prompt: string, imageData: string, mimeType: string = "image/png"): Promise<VertexEditResponse> {
    try {
      console.log("Editing image with Vertex AI, prompt:", prompt);
      
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-2.5-flash`;
      
      const instance = {
        prompt: prompt,
        image: {
          bytesBase64Encoded: imageData,
          mimeType: mimeType,
        },
      };

      const request = {
        endpoint,
        instances: [instance],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      const [response] = await this.client.predict(request);
      
      console.log("Vertex AI edit response:", JSON.stringify(response, null, 2));

      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = response.predictions[0];
      
      if (prediction.content) {
        const content = prediction.content as any;
        
        if (content.bytesBase64Encoded) {
          const imageData = content.bytesBase64Encoded;
          const dataUrl = `data:image/png;base64,${imageData}`;
          
          return {
            success: true,
            imageUrl: dataUrl
          };
        }
      }

      throw new Error("No image data found in Vertex AI response");
    } catch (error) {
      console.error("Error editing image with Vertex AI:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-2.5-flash`;
      
      const instance = {
        prompt: prompt,
      };

      const request = {
        endpoint,
        instances: [instance],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      const [response] = await this.client.predict(request);
      
      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = response.predictions[0];
      return prediction.content as string || "";
    } catch (error) {
      console.error("Error generating text with Vertex AI:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const vertexAIClient = new VertexAIClient();
