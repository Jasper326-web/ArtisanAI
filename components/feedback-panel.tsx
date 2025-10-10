'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, CheckCircle, AlertCircle, Calendar, Star, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { trackFeedback } from '@/lib/umami';

interface FeedbackData {
  content: string;
  rating?: number;
  email?: string;
  name?: string;
}

interface UpdateNote {
  id: string;
  version: string;
  title: string;
  content: string;
  date: string;
  type: 'feature' | 'fix' | 'improvement';
}

// Mock update notes - in production, this would come from Supabase
const getMockUpdates = (t: any): UpdateNote[] => [
  {
    id: '1',
    version: 'v2.0.0',
    title: t?.updates?.v2_0_0?.title || '🎉 全新界面设计 & 积分系统升级',
    content: t?.updates?.v2_0_0?.content || '全新设计的用户界面，采用现代化玻璃拟态效果。用户注册积分从120提升至220，更慷慨的免费额度。新增多语言支持，中英文无缝切换。全新的标签系统展示产品特色。',
    date: '2025-01-15',
    type: 'feature'
  },
  {
    id: '2',
    version: 'v1.9.0',
    title: t?.updates?.v1_9_0?.title || '🎨 界面美化 & 用户体验优化',
    content: t?.updates?.v1_9_0?.content || '重新设计主标题和副标题样式，采用彩虹渐变效果。优化标签设计，使用玻璃拟态效果和半透明边框。调整页面间距和布局，提升整体视觉效果。',
    date: '2025-01-14',
    type: 'improvement'
  },
  {
    id: '3',
    version: 'v1.8.0',
    title: 'API Integration Overhaul & Production Stability',
    content: 'Major refactor of Google Gemini API integration using official @google/genai SDK. Fixed API calling conventions, response handling, and Modality configuration. All 5 API keys now working perfectly with 100% success rate. System now extremely stable for production use.',
    date: '2025-10-10',
    type: 'feature'
  },
  {
    id: '2',
    version: 'v1.7.0',
    title: 'Aspect Ratio Selection & Model Stability',
    content: 'Added output aspect ratio selection with 10 different ratios (21:9, 16:9, 4:3, 3:2, 1:1, 9:16, 3:4, 2:3, 5:4, 4:5). Upgraded to official Gemini 2.5 Flash Image model for enhanced stability and image-only output. Improved prompt engineering for better aspect ratio control.',
    date: '2025-10-09',
    type: 'feature'
  },
  {
    id: '3',
    version: 'v1.6.0',
    title: 'UI/UX Enhancements & Bug Fixes',
    content: 'Enhanced image generation button colors for better visibility, beautified keyword tags with colorful borders, fixed hardcoded Chinese text in generate button, and improved overall user interface consistency.',
    date: '2025-10-09',
    type: 'improvement'
  },
  {
    id: '4',
    version: 'v1.5.0',
    title: 'Image Generation UI Enhancement',
    content: 'Redesigned image generation buttons with modern UI, enhanced preview modal for full image viewing, improved hover effects and animations. Added ESC key support and better user experience.',
    date: '2025-10-08',
    type: 'improvement'
  },
  {
    id: '5',
    version: 'v1.4.0',
    title: 'Google Login UI Enhancement',
    content: 'Redesigned Google login button with modern UI, smooth animations, and improved user experience. Added hover effects, loading states, and brand-consistent styling.',
    date: '2025-10-07',
    type: 'improvement'
  },
  {
    id: '6',
    version: 'v1.3.5',
    title: 'Generation UI Improvements',
    content: 'Fixed hardcoded Chinese text in image generation box. Added proper English translations and enhanced icon button visibility with better styling and hover effects.',
    date: '2025-10-07',
    type: 'fix'
  },
  {
    id: '7',
    version: 'v1.3.0',
    title: 'Database Schema Optimization',
    content: 'Optimized database schema by removing redundant users table, fixed column ambiguity issues in RPC functions, and improved credit management system reliability.',
    date: '2025-10-06',
    type: 'improvement'
  },
  {
    id: '8',
    version: 'v1.2.5',
    title: 'Payment System Fixes',
    content: 'Resolved Creem webhook configuration issues, fixed credit synchronization problems, and improved payment flow reliability. Added manual webhook testing capabilities.',
    date: '2025-10-05',
    type: 'fix'
  },
  {
    id: '9',
    version: 'v1.2.0',
    title: 'Multi-language Support',
    content: 'Added comprehensive support for English and Chinese languages with proper translation keys, fixed hardcoded text issues across all pages.',
    date: '2025-10-04',
    type: 'feature'
  },
  {
    id: '10',
    version: 'v1.1.5',
    title: 'Image Upload Improvements',
    content: 'Enhanced drag-and-drop functionality with better error handling, progress indicators, and improved file validation.',
    date: '2025-10-03',
    type: 'improvement'
  },
  {
    id: '11',
    version: 'v1.1.0',
    title: 'Character Consistency',
    content: 'Improved AI model for better character consistency across different styles and poses using Nano-Banana technology.',
    date: '2025-10-02',
    type: 'feature'
  },
  {
    id: '12',
    version: 'v1.0.8',
    title: 'Bug Fixes',
    content: 'Fixed credit deduction issues, improved error messages, and enhanced user experience with better feedback systems.',
    date: '2025-10-01',
    type: 'fix'
  }
];

export function FeedbackPanel() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    content: '',
    rating: 5
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!feedbackData.content.trim()) return;

    // 追踪反馈提交
    trackFeedback('submit', { 
      rating: feedbackData.rating, 
      hasEmail: !!feedbackData.email, 
      hasName: !!feedbackData.name 
    });

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: feedbackData.content,
          meta: {
            type: feedbackData.type,
            rating: feedbackData.rating,
            email: feedbackData.email,
            name: feedbackData.name,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        trackFeedback('success', { rating: feedbackData.rating });
        setFeedbackData({
          content: '',
          rating: 5
        });
        setTimeout(() => {
          setSubmitStatus('idle');
          setIsOpen(false);
        }, 2000);
      } else {
        setSubmitStatus('error');
        trackFeedback('error', { status: response.status });
      }
    } catch (error) {
      setSubmitStatus('error');
      trackFeedback('error', { error: 'network' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUpdateTypeColor = (type: UpdateNote['type']) => {
    switch (type) {
      case 'feature':
        return 'bg-green-500';
      case 'fix':
        return 'bg-blue-500';
      case 'improvement':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getUpdateTypeLabel = (type: UpdateNote['type']) => {
    switch (type) {
      case 'feature':
        return t?.feedback?.updates?.types?.feature || 'Feature';
      case 'fix':
        return t?.feedback?.updates?.types?.fix || 'Fix';
      case 'improvement':
        return t?.feedback?.updates?.types?.improvement || 'Improvement';
      default:
        return 'Update';
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg transition-all duration-300",
            "hover:scale-110 hover:shadow-xl",
            "bg-background/80 backdrop-blur-sm border-2",
            isOpen && "scale-110 shadow-xl"
          )}
          onMouseEnter={() => {
            if (!isOpen) {
              setIsOpen(true);
              trackFeedback('open');
            }
          }}
          onClick={() => {
            if (!isOpen) {
              trackFeedback('open');
            }
            setIsOpen(!isOpen);
          }}
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Feedback Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-50 w-80 max-h-[80vh]"
          onMouseLeave={() => setIsOpen(false)}
        >
          <Card className="shadow-2xl border-2 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {t?.feedback?.updates?.title || 'Recent Updates'}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Updates Section */}
              <div className="space-y-4">
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {getMockUpdates(t).map((update) => (
                      <div key={update.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-white text-xs", getUpdateTypeColor(update.type))}
                          >
                            {getUpdateTypeLabel(update.type)}
                          </Badge>
                          <span className="text-sm font-medium">{update.version}</span>
                          <span className="text-xs text-muted-foreground">{update.date}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{update.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{update.content}</p>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
