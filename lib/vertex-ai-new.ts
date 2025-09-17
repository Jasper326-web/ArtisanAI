import { PredictionServiceClient } from '@google-cloud/aiplatform';

export interface VertexImageResponse {
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
      keyFilename: './vertex-express-key.json',
    });
  }

  async generateImage(prompt: string): Promise<VertexImageResponse> {
    try {
      console.log("Generating image with Vertex AI, prompt:", prompt);
      
      // Use the correct endpoint for Gemini models
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-2.5-flash`;
      
      // Create the request payload according to Vertex AI documentation
      const instance = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 32768,
          temperature: 1,
          topP: 0.95,
          responseModalities: ["TEXT", "IMAGE"],
          safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
          ],
        }
      };

      const request = {
        endpoint,
        instances: [instance],
        parameters: {},
      };

      const [response] = await this.client.predict(request);
      
      console.log("Vertex AI response:", JSON.stringify(response, null, 2));

      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = response.predictions[0];
      
      // Handle image generation response
      if (prediction.content) {
        const content = prediction.content as any;
        
        // Look for image data in the response
        if (content.parts) {
          for (const part of content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              const dataUrl = `data:${mimeType};base64,${imageData}`;
              
              return {
                success: true,
                imageUrl: dataUrl
              };
            }
          }
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

  async editImage(prompt: string, imageData: string, mimeType: string = "image/png"): Promise<VertexImageResponse> {
    try {
      console.log("Editing image with Vertex AI, prompt:", prompt);
      
      const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-2.5-flash`;
      
      const instance = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              },
              {
                inlineData: {
                  mimeType,
                  data: imageData,
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 32768,
          temperature: 1,
          topP: 0.95,
          responseModalities: ["TEXT", "IMAGE"],
        }
      };

      const request = {
        endpoint,
        instances: [instance],
        parameters: {},
      };

      const [response] = await this.client.predict(request);
      
      console.log("Vertex AI edit response:", JSON.stringify(response, null, 2));

      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = response.predictions[0];
      
      if (prediction.content) {
        const content = prediction.content as any;
        
        if (content.parts) {
          for (const part of content.parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              const dataUrl = `data:${mimeType};base64,${imageData}`;
              
              return {
                success: true,
                imageUrl: dataUrl
              };
            }
          }
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
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        }
      };

      const request = {
        endpoint,
        instances: [instance],
        parameters: {},
      };

      const [response] = await this.client.predict(request);
      
      if (!response.predictions || response.predictions.length === 0) {
        throw new Error("No predictions returned from Vertex AI");
      }

      const prediction = response.predictions[0];
      const content = prediction.content as any;
      
      if (content.parts) {
        const textParts = content.parts.filter((part: any) => part.text);
        return textParts.map((part: any) => part.text).join(" ");
      }
      
      return "";
    } catch (error) {
      console.error("Error generating text with Vertex AI:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const vertexAIClient = new VertexAIClient();
