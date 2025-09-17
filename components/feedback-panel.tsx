'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, CheckCircle, AlertCircle, Calendar, Star } from 'lucide-react';
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

interface FeedbackData {
  content: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
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
const mockUpdates: UpdateNote[] = [
  {
    id: '1',
    version: 'v1.2.0',
    title: 'Multi-language Support',
    content: 'Added support for 10 languages including Chinese, Spanish, French, German, Japanese, Korean, Portuguese, Russian, and Arabic.',
    date: '2024-01-15',
    type: 'feature'
  },
  {
    id: '2',
    version: 'v1.1.5',
    title: 'Image Upload Improvements',
    content: 'Enhanced drag-and-drop functionality with better error handling and progress indicators.',
    date: '2024-01-10',
    type: 'improvement'
  },
  {
    id: '3',
    version: 'v1.1.0',
    title: 'Character Consistency',
    content: 'Improved AI model for better character consistency across different styles and poses.',
    date: '2024-01-05',
    type: 'feature'
  },
  {
    id: '4',
    version: 'v1.0.8',
    title: 'Bug Fixes',
    content: 'Fixed credit deduction issues and improved error messages for better user experience.',
    date: '2024-01-01',
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
    type: 'other',
    rating: 5
  });
  const [showUpdates, setShowUpdates] = useState(false);
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
        setFeedbackData({
          content: '',
          type: 'other',
          rating: 5
        });
        setTimeout(() => {
          setSubmitStatus('idle');
          setIsOpen(false);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
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
          onMouseEnter={() => setIsOpen(true)}
          onClick={() => setIsOpen(!isOpen)}
        >
          <MessageSquare className="w-5 h-5" />
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
                  <MessageSquare className="w-5 h-5" />
                  {t?.feedback?.title || 'Feedback & Updates'}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUpdates(!showUpdates)}
                    className="h-8 px-2"
                  >
                    <Calendar className="w-4 h-4" />
                  </Button>
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
              {showUpdates ? (
                // Updates Section
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <h3 className="font-semibold">
                      {t?.feedback?.updates?.title || 'Recent Updates'}
                    </h3>
                  </div>
                  
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {mockUpdates.map((update) => (
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
              ) : (
                // Feedback Section
                <div className="space-y-4">
                  {submitStatus === 'success' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">
                        {t?.feedback?.success || 'Thank you for your feedback!'}
                      </span>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        {t?.feedback?.error || 'Failed to submit feedback. Please try again.'}
                      </span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="feedback-type">
                        {t?.feedback?.type || 'Type'}
                      </Label>
                      <Select
                        value={feedbackData.type}
                        onValueChange={(value: any) => setFeedbackData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">
                            {t?.feedback?.types?.bug || 'Bug Report'}
                          </SelectItem>
                          <SelectItem value="feature">
                            {t?.feedback?.types?.feature || 'Feature Request'}
                          </SelectItem>
                          <SelectItem value="improvement">
                            {t?.feedback?.types?.improvement || 'Improvement'}
                          </SelectItem>
                          <SelectItem value="other">
                            {t?.feedback?.types?.other || 'Other'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="feedback-rating">
                        {t?.feedback?.rating || 'Rating'} ({feedbackData.rating}/5)
                      </Label>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "w-5 h-5 cursor-pointer transition-colors",
                              star <= (feedbackData.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-400"
                            )}
                            onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="feedback-content">
                        {t?.feedback?.content || 'Your Feedback'}
                      </Label>
                      <Textarea
                        id="feedback-content"
                        placeholder={t?.feedback?.placeholder || 'Tell us what you think...'}
                        value={feedbackData.content}
                        onChange={(e) => setFeedbackData(prev => ({ ...prev, content: e.target.value }))}
                        className="min-h-[100px] resize-none"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="feedback-name">
                          {t?.feedback?.name || 'Name (Optional)'}
                        </Label>
                        <Input
                          id="feedback-name"
                          placeholder={t?.feedback?.namePlaceholder || 'Your name'}
                          value={feedbackData.name || ''}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="feedback-email">
                          {t?.feedback?.email || 'Email (Optional)'}
                        </Label>
                        <Input
                          id="feedback-email"
                          type="email"
                          placeholder={t?.feedback?.emailPlaceholder || 'your@email.com'}
                          value={feedbackData.email || ''}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={!feedbackData.content.trim() || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {t?.feedback?.submitting || 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t?.feedback?.submit || 'Submit Feedback'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
