// Image upload utilities for handling base64 and file uploads
// Supports multiple image formats and size validation

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  base64?: string;
}

export interface UploadOptions {
  maxSize?: number; // in bytes, default 10MB
  allowedTypes?: string[]; // default ['image/jpeg', 'image/png', 'image/webp']
  maxImages?: number; // default 5
}

const DEFAULT_OPTIONS: Required<UploadOptions> = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImages: 5,
};

export function validateImageFile(file: File, options: UploadOptions = {}): string | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!opts.allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes.join(', ')}`;
  }
  
  if (file.size > opts.maxSize) {
    return `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum ${(opts.maxSize / 1024 / 1024).toFixed(2)}MB`;
  }
  
  return null;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function base64ToDataUrl(base64: string, mimeType: string = 'image/jpeg'): string {
  // Remove data URL prefix if present
  const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  return `data:${mimeType};base64,${cleanBase64}`;
}

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.replace(/^data:[^;]+;base64,/, '');
}

export function compressImage(
  file: File, 
  maxWidth: number = 1024, 
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function processImageUpload(
  files: FileList | File[], 
  options: UploadOptions = {}
): Promise<{ images: UploadedImage[]; errors: string[] }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fileArray = Array.from(files);
  const images: UploadedImage[] = [];
  const errors: string[] = [];
  
  if (fileArray.length > opts.maxImages) {
    errors.push(`Maximum ${opts.maxImages} images allowed`);
    return { images, errors };
  }
  
  for (const file of fileArray) {
    const validationError = validateImageFile(file, opts);
    if (validationError) {
      errors.push(`${file.name}: ${validationError}`);
      continue;
    }
    
    try {
      const base64 = await fileToBase64(file);
      const compressedBase64 = await compressImage(file);
      
      images.push({
        id: generateImageId(),
        url: compressedBase64,
        name: file.name,
        size: file.size,
        type: file.type,
        base64: dataUrlToBase64(compressedBase64),
      });
    } catch (error) {
      errors.push(`${file.name}: Failed to process image`);
    }
  }
  
  return { images, errors };
}

// Utility for creating image URLs from base64 data
export function createImageUrl(base64: string, mimeType: string = 'image/jpeg'): string {
  return base64ToDataUrl(base64, mimeType);
}

// Utility for extracting image dimensions from base64
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64ToDataUrl(base64);
  });
}
