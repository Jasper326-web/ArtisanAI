'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processImageUpload, UploadedImage, UploadOptions } from '@/lib/upload';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImagesChange,
  maxImages = 15, // 根据官方文档，最多支持15张图片
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
}: ImageUploadProps) {
  const { t } = useLanguage();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadOptions: UploadOptions = {
    maxSize,
    maxImages,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { images: newImages, errors: uploadErrors } = await processImageUpload(files, uploadOptions);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadErrors.length > 0) {
        setErrors(uploadErrors);
      }

      const updatedImages = [...images, ...newImages].slice(0, maxImages);
      setImages(updatedImages);
      onImagesChange(updatedImages);

      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (error) {
      setErrors([`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [images, maxImages, uploadOptions, onImagesChange, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeImage = useCallback((imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragging && !disabled
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4">
            {isUploading ? (
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {isUploading ? (t?.hero?.processing || 'Processing Images...') : (t?.hero?.uploadText || '上传图片并输入提示词')}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            {t?.upload?.dropHere || 'Drag and drop images here, or click to browse'}
          </p>
          
          <p className="text-xs text-muted-foreground">
            {(t?.upload?.supportsTpl || 'Supports JPEG, PNG, WebP • Max {max} images • {size}MB each')
              .replace('{max}', String(maxImages))
              .replace('{size}', String((maxSize / 1024 / 1024).toFixed(0)))}
          </p>
          
          {maxImages > 1 && (
            <p className="text-xs text-primary/80 mt-2">
              {'💡 ' + (t?.upload?.tipTpl || 'Upload multiple images to create a fusion of their best features (up to {max} images supported)')
                .replace('{max}', String(maxImages))}
            </p>
          )}

          {isUploading && (
            <div className="w-full mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            {(t?.upload?.referenceImages || 'Reference Images ({count}/{max})')
              .replace('{count}', String(images.length))
              .replace('{max}', String(maxImages))}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image) => (
              <Card key={image.id} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate" title={image.name}>
                      {image.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button (Alternative) */}
      {images.length === 0 && !isUploading && (
        <Button
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
          className="w-full"
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          {t?.upload?.chooseImages || t?.hero?.chooseImages || 'Choose Images'}
        </Button>
      )}
    </div>
  );
}
