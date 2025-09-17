'use client';

import React, { useState, useCallback } from 'react';
import { Wand2, Settings, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageUpload, UploadedImage } from './image-upload';
import { cn } from '@/lib/utils';

interface PromptBuilderProps {
  onGenerate: (data: {
    prompt: string;
    images: UploadedImage[];
    model: string;
    temperature: number;
    maxTokens: number;
  }) => void;
  isGenerating?: boolean;
  className?: string;
}

const STYLE_PRESETS = [
  { id: 'realistic', label: 'Realistic', prompt: 'photorealistic, high quality, detailed' },
  { id: 'anime', label: 'Anime', prompt: 'anime style, manga, vibrant colors' },
  { id: 'portrait', label: 'Portrait', prompt: 'professional portrait, studio lighting, sharp focus' },
  { id: 'fantasy', label: 'Fantasy', prompt: 'fantasy art, magical, ethereal, mystical' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'cyberpunk, neon lights, futuristic, high tech' },
  { id: 'vintage', label: 'Vintage', prompt: 'vintage style, retro, classic, nostalgic' },
];

const MODEL_OPTIONS = [
  { value: 'google/gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash (Recommended)' },
  { value: 'google/gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Experimental' },
  { value: 'openai/gpt-4o', label: 'GPT-4o' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
];

export function PromptBuilder({ onGenerate, isGenerating = false, className }: PromptBuilderProps) {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [model, setModel] = useState('google/gemini-2.5-flash-image-preview');
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStyleSelect = useCallback((styleId: string) => {
    const style = STYLE_PRESETS.find(s => s.id === styleId);
    if (style) {
      setSelectedStyle(styleId);
      if (prompt && !prompt.includes(style.prompt)) {
        setPrompt(prev => `${prev}, ${style.prompt}`);
      } else if (!prompt) {
        setPrompt(style.prompt);
      }
    }
  }, [prompt]);

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      images,
      model,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
    });
  }, [prompt, images, model, temperature, maxTokens, onGenerate]);

  const canGenerate = prompt.trim().length > 0 && !isGenerating;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          AI Image Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe your image</label>
          <Textarea
            placeholder="A beautiful portrait of a person in a garden, professional photography, soft lighting..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Be specific about style, lighting, composition, and details for better results.
          </p>
        </div>

        {/* Style Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Style Presets</label>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((style) => (
              <Badge
                key={style.id}
                variant={selectedStyle === style.id ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleStyleSelect(style.id)}
              >
                {style.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Reference Images */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Reference Images (Optional)
          </label>
          <ImageUpload
            onImagesChange={setImages}
            maxImages={3}
            maxSize={5 * 1024 * 1024} // 5MB per image
            disabled={isGenerating}
          />
        </div>

        <Separator />

        {/* Advanced Settings */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Advanced Settings
            {showAdvanced ? '↑' : '↓'}
          </Button>

          {showAdvanced && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Select value={model} onValueChange={setModel} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Creativity: {temperature[0].toFixed(1)}
                </label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values = more creative, lower values = more consistent
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Max Tokens: {maxTokens[0]}
                </label>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  max={2000}
                  min={100}
                  step={100}
                  className="w-full"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of the generated response
                </p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Image (50 Credits)
            </>
          )}
        </Button>

        {/* Generation Info */}
        {images.length > 0 && (
          <div className="text-xs text-muted-foreground text-center">
            Using {images.length} reference image{images.length > 1 ? 's' : ''} for character consistency
          </div>
        )}
      </CardContent>
    </Card>
  );
}
