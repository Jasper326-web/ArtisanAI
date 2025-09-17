// OpenRouter API client for image generation and analysis
// Supports Gemini 2.5 Flash Image Preview and other models

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
      detail?: 'low' | 'high' | 'auto';
    };
  }>;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private siteUrl?: string;
  private siteName?: string;

  constructor(
    apiKey: string,
    baseUrl: string = 'https://openrouter.ai/api/v1',
    siteUrl?: string,
    siteName?: string
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.siteUrl = siteUrl;
    this.siteName = siteName;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (this.siteUrl) {
      headers['HTTP-Referer'] = this.siteUrl;
    }
    if (this.siteName) {
      headers['X-Title'] = this.siteName;
    }

    return headers;
  }

  async generateImage(
    prompt: string,
    referenceImages?: string[],
    model: string = 'google/gemini-2.5-flash-image-preview'
  ): Promise<string> {
    // Gemini 2.5 Flash Image Preview (nano banana) is a powerful image generation model
    // It can generate images from text prompts and maintain character consistency
    
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Generate a high-quality image based on this prompt: ${prompt}. Create a detailed, visually appealing image that matches the description.`
          }
        ]
      }
    ];

    // Add reference images if provided for character consistency
    if (referenceImages && referenceImages.length > 0) {
      for (const imageUrl of referenceImages) {
        messages[0].content.push({
          type: 'image_url',
          image_url: {
            url: imageUrl,
            detail: 'high'
          }
        });
      }
      
      // Add context for reference images
      messages[0].content.push({
        type: 'text',
        text: 'Use these reference images to maintain character consistency and style in the generated image.'
      });
    }

    const request: OpenRouterRequest = {
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const error: OpenRouterError = await response.json();
          errorMessage = error.error?.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      // Extract the generated image from the response
      const content = data.choices?.[0]?.message?.content;
      
      if (content) {
        // Look for image URLs in the response
        const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
        if (urlMatch) {
          return urlMatch[0];
        }
        
        // Look for base64 image data
        const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          return base64Match[0];
        }
        
        // If the model returns a description instead of an image URL,
        // it might be that the model is describing what it would generate
        // In this case, we'll return the content as a text-based placeholder
        console.log('Model response (no image URL found):', content);
        return `data:image/svg+xml;base64,${btoa(`
          <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" fill="#f0f0f0"/>
            <text x="256" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">
              Generated Image Description:
            </text>
            <text x="256" y="250" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
              ${content.substring(0, 80)}...
            </text>
            <text x="256" y="400" text-anchor="middle" font-family="Arial" font-size="10" fill="#999">
              Model response received - check console for details
            </text>
          </svg>
        `)}`;
      }
      
      // Fallback: return a placeholder
      return 'data:image/png;base64,placeholder';
      
    } catch (error) {
      console.error('OpenRouter API call failed:', error);
      throw error;
    }
  }

  async analyzeImage(
    imageUrl: string,
    prompt: string = 'Describe this image in detail',
    model: string = 'google/gemini-2.5-flash-image-preview'
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
              detail: 'high'
            }
          }
        ]
      }
    ];

    const request: OpenRouterRequest = {
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.3,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const error: OpenRouterError = await response.json();
          errorMessage = error.error?.message || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
        }
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices?.[0]?.message?.content || 'No description available';
      
    } catch (error) {
      console.error('OpenRouter image analysis failed:', error);
      throw error;
    }
  }
}

// Factory function to create OpenRouter client from environment variables
export function createOpenRouterClient(): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const siteUrl = process.env.SITE_URL;
  const siteName = process.env.SITE_NAME || 'ArtisanAI';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }

  return new OpenRouterClient(apiKey, baseUrl, siteUrl, siteName);
}
