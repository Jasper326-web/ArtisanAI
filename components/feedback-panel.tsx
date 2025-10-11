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
const getMockUpdates = (t: any, isChinese: boolean = false): UpdateNote[] => [
  {
    id: '0',
    version: 'v2.1.0',
    title: t?.updates?.v2_1_0?.title || (isChinese ? '🚀 重大模型与功能更新 (2024年10月9-11日)' : '🚀 Major Model & Feature Updates (Oct 9-11, 2024)'),
    content: t?.updates?.v2_1_0?.content || (isChinese ? 'Google官方于10月9日推出生产级别的Nano Banana稳定模型，模型稳定性进一步提升。增加基于Imagen-4.0模型的创意生图模式，与Nano Banana的编辑模式相辅相成，实现一站式创意AI图片生成&编辑。优化主副标题样式。提升首次登陆用户的免费积分额度，从120提升至220，免费生图额度提升80%。' : 'Google officially launched production-level Nano Banana stable model with enhanced stability. Added creative generation mode based on Imagen-4.0 model, complementing Nano Banana\'s editing mode for one-stop AI image generation & editing. Optimized main and subtitle styling. Increased free credits for new users from 120 to 220, boosting free generation quota by 80%.'),
    date: '2024-10-11',
    type: 'feature'
  },
  {
    id: '1',
    version: 'v2.0.0',
    title: t?.updates?.v2_0_0?.title || (isChinese ? '🎉 全新界面设计 & 积分系统升级' : '🎉 Brand New UI Design & Credit System Upgrade'),
    content: t?.updates?.v2_0_0?.content || (isChinese ? '全新设计的用户界面，采用现代化玻璃拟态效果。用户注册积分从120提升至220，更慷慨的免费额度。新增多语言支持，中英文无缝切换。全新的标签系统展示产品特色。' : 'Completely redesigned user interface with modern glassmorphism effects. User registration credits increased from 120 to 220, offering more generous free credits. Added multi-language support with seamless Chinese-English switching. New tag system showcasing product features.'),
    date: '2024-10-10',
    type: 'feature'
  },
  {
    id: '2',
    version: 'v1.9.0',
    title: t?.updates?.v1_9_0?.title || (isChinese ? '🎨 界面美化 & 用户体验优化' : '🎨 UI Beautification & User Experience Optimization'),
    content: t?.updates?.v1_9_0?.content || (isChinese ? '重新设计主标题和副标题样式，采用彩虹渐变效果。优化标签设计，使用玻璃拟态效果和半透明边框。调整页面间距和布局，提升整体视觉效果。' : 'Redesigned main title and subtitle styles with rainbow gradient effects. Optimized tag design using glassmorphism effects and semi-transparent borders. Adjusted page spacing and layout for enhanced visual appeal.'),
    date: '2024-10-09',
    type: 'improvement'
  },
  {
    id: '3',
    version: 'v1.8.0',
    title: isChinese ? 'API集成重构 & 生产稳定性' : 'API Integration Overhaul & Production Stability',
    content: isChinese ? '使用官方@google/genai SDK对Google Gemini API集成进行重大重构。修复了API调用约定、响应处理和模态配置。所有5个API密钥现在都能完美工作，成功率达到100%。系统现在对生产使用极其稳定。' : 'Major refactor of Google Gemini API integration using official @google/genai SDK. Fixed API calling conventions, response handling, and Modality configuration. All 5 API keys now working perfectly with 100% success rate. System now extremely stable for production use.',
    date: '2024-10-08',
    type: 'feature'
  },
  {
    id: '4',
    version: 'v1.7.0',
    title: isChinese ? '宽高比选择 & 模型稳定性' : 'Aspect Ratio Selection & Model Stability',
    content: isChinese ? '添加了10种不同宽高比的输出选择（21:9, 16:9, 4:3, 3:2, 1:1, 9:16, 3:4, 2:3, 5:4, 4:5）。升级到官方Gemini 2.5 Flash图像模型，增强稳定性和纯图像输出。改进了提示工程以获得更好的宽高比控制。' : 'Added output aspect ratio selection with 10 different ratios (21:9, 16:9, 4:3, 3:2, 1:1, 9:16, 3:4, 2:3, 5:4, 4:5). Upgraded to official Gemini 2.5 Flash Image model for enhanced stability and image-only output. Improved prompt engineering for better aspect ratio control.',
    date: '2024-10-07',
    type: 'feature'
  },
  {
    id: '5',
    version: 'v1.6.0',
    title: isChinese ? 'UI/UX增强 & 错误修复' : 'UI/UX Enhancements & Bug Fixes',
    content: isChinese ? '增强了图像生成按钮颜色以提高可见性，美化了关键词标签的彩色边框，修复了生成按钮中的硬编码中文文本，并改善了整体用户界面一致性。' : 'Enhanced image generation button colors for better visibility, beautified keyword tags with colorful borders, fixed hardcoded Chinese text in generate button, and improved overall user interface consistency.',
    date: '2024-10-06',
    type: 'improvement'
  },
  {
    id: '6',
    version: 'v1.5.0',
    title: isChinese ? '图像生成UI增强' : 'Image Generation UI Enhancement',
    content: isChinese ? '使用现代UI重新设计图像生成按钮，增强了全图像查看的预览模态，改进了悬停效果和动画。添加了ESC键支持和更好的用户体验。' : 'Redesigned image generation buttons with modern UI, enhanced preview modal for full image viewing, improved hover effects and animations. Added ESC key support and better user experience.',
    date: '2024-10-05',
    type: 'improvement'
  },
  {
    id: '7',
    version: 'v1.4.0',
    title: isChinese ? 'Google登录UI增强' : 'Google Login UI Enhancement',
    content: isChinese ? '使用现代UI重新设计Google登录按钮，流畅的动画和改善的用户体验。添加了悬停效果、加载状态和品牌一致的样式。' : 'Redesigned Google login button with modern UI, smooth animations, and improved user experience. Added hover effects, loading states, and brand-consistent styling.',
    date: '2024-10-04',
    type: 'improvement'
  },
  {
    id: '8',
    version: 'v1.3.5',
    title: isChinese ? '生成UI改进' : 'Generation UI Improvements',
    content: isChinese ? '修复了图像生成框中的硬编码中文文本。添加了适当的英文翻译，并通过更好的样式和悬停效果增强了图标按钮的可见性。' : 'Fixed hardcoded Chinese text in image generation box. Added proper English translations and enhanced icon button visibility with better styling and hover effects.',
    date: '2024-10-03',
    type: 'fix'
  },
  {
    id: '9',
    version: 'v1.3.0',
    title: isChinese ? '数据库架构优化' : 'Database Schema Optimization',
    content: isChinese ? '通过删除冗余的用户表优化了数据库架构，修复了RPC函数中的列歧义问题，并改善了积分管理系统的可靠性。' : 'Optimized database schema by removing redundant users table, fixed column ambiguity issues in RPC functions, and improved credit management system reliability.',
    date: '2024-10-02',
    type: 'improvement'
  }
];

export function FeedbackPanel() {
  const { t, language } = useLanguage();
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
            "h-12 px-4 rounded-full shadow-lg transition-all duration-300",
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
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t?.feedback?.buttonLabel || 'Update Notes'}
            </span>
          </div>
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
                    {getMockUpdates(t, language === 'zh').map((update) => (
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
