'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  attachment?: File;
}

export function ContactForm() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    attachment: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小 (最大 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: t?.contact?.form?.file_too_large || "文件过大",
          description: t?.contact?.form?.file_too_large_desc || "请选择小于10MB的文件。",
          variant: "destructive",
        });
        return;
      }
      
      // 检查文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t?.contact?.form?.invalid_file_type || "无效文件类型",
          description: t?.contact?.form?.invalid_file_type_desc || "请选择图片文件（JPEG、PNG、GIF、WebP）。",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 创建 FormData 以支持文件上传
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      
      if (formData.attachment) {
        formDataToSend.append('attachment', formData.attachment);
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formDataToSend, // 使用 FormData 而不是 JSON
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '', attachment: undefined });
        toast({
          title: t?.contact?.form?.message_sent_success || "消息发送成功！",
          description: t?.contact?.form?.message_sent_success_desc || "感谢您联系我们。我们会尽快回复您。",
        });
      } else {
        setSubmitStatus('error');
        toast({
          title: t?.contact?.form?.failed_to_send || "发送消息失败",
          description: result.error || t?.contact?.form?.failed_to_send_desc || "请稍后重试。",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      toast({
        title: t?.contact?.form?.network_error || "网络错误",
        description: t?.contact?.form?.network_error_desc || "请检查您的连接并重试。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-card/80 border border-primary/30 shadow-2xl shadow-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-foreground flex items-center justify-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          {t?.contact?.form?.title || '联系我们'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitStatus === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">{t?.contact?.form?.message_sent || '消息已发送！'}</h3>
            <p className="text-muted-foreground mb-4">
              {t?.contact?.form?.message_sent_desc || '感谢您联系我们。我们将在24小时内回复您。'}
            </p>
            <Button 
              onClick={() => setSubmitStatus('idle')}
              variant="outline"
            >
              {t?.contact?.form?.send_another || '发送另一条消息'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{t?.contact?.form?.name || '姓名'} *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t?.contact?.form?.name_placeholder || '您的全名'}
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t?.contact?.form?.email || '邮箱'} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t?.contact?.form?.email_placeholder || 'your.email@example.com'}
                  className="bg-background/50 border-primary/20 focus:border-primary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-foreground">{t?.contact?.form?.subject || '主题'} *</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                required
                value={formData.subject}
                onChange={handleInputChange}
                placeholder={t?.contact?.form?.subject_placeholder || '这是关于什么的？'}
                className="bg-background/50 border-primary/20 focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-foreground">{t?.contact?.form?.message || '消息'} *</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t?.contact?.form?.message_placeholder || '告诉我们更多关于您的询问...'}
                className="bg-background/50 border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment" className="text-foreground">{t?.contact?.form?.attachment || '附件（可选）'}</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="attachment"
                    name="attachment"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-background/50 border-primary/20 focus:border-primary/50"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {formData.attachment && (
                  <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                    <span className="text-sm text-foreground flex-1">
                      {formData.attachment.name} ({(formData.attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, attachment: undefined }))}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  {t?.contact?.form?.file_formats || '支持格式：JPEG、PNG、GIF、WebP（最大10MB）'}
                </p>
              </div>
            </div>

            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">
                  {t?.contact?.form?.failed_to_send_error || '发送消息失败。请重试。'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold py-3"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t?.contact?.form?.sending || '发送中...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {t?.contact?.form?.send_message || '发送消息'}
                </div>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
