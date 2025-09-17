import { VertexAI } from '@google-cloud/vertexai';

export interface VertexImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class VertexAIClient {
  private vertexAI: VertexAI;
  private projectId: string;
  private location: string;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'artisan-ai-471601';
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    this.vertexAI = new VertexAI({
      project: this.projectId,
      location: this.location,
      keyFilename: './vertex-express-key.json',
    });
  }

  async generateImage(prompt: string): Promise<VertexImageResponse> {
    try {
      console.log("Generating image with Vertex AI, prompt:", prompt);
      
      // Use the correct Vertex AI SDK for Gemini
      const model = this.vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          maxOutputTokens: 32768,
          temperature: 1,
          topP: 0.95,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' }
        ],
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      console.log("Vertex AI response:", JSON.stringify(response, null, 2));

      // Check for image data in the response
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
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

      // For text generation, return the text content
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        if (candidate.content && candidate.content.parts) {
          const textParts = candidate.content.parts.filter(part => part.text);
          const text = textParts.map(part => part.text).join(" ");
          console.log("Generated text:", text);
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
      
      const model = this.vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          maxOutputTokens: 32768,
          temperature: 1,
          topP: 0.95,
        }
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType,
            data: imageData,
          }
        }
      ]);
      
      const response = await result.response;
      console.log("Vertex AI edit response:", JSON.stringify(response, null, 2));

      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
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
      const model = this.vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return response.text() || "";
    } catch (error) {
      console.error("Error generating text with Vertex AI:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const vertexAIClient = new VertexAIClient();
