'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/language-context';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import { trackAuth } from '@/lib/umami';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

// Error message mapping for user-friendly display
const getErrorMessage = (error: any): string => {
  const message = error?.message || error?.error_description || '';
  
  if (message.includes('Invalid login credentials') || message.includes('401')) {
    return '邮箱或密码不正确，请重试。';
  }
  if (message.includes('User already registered') || message.includes('unique')) {
    return '该邮箱已被注册。若您未收到验证邮件，请点击重新发送验证邮件。';
  }
  if (message.includes('Email not authorized') || message.includes('SMTP')) {
    return '系统当前无法发送验证邮件，请联系管理员或稍后重试。';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return '操作过于频繁，请稍后重试。';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return '网络或服务器异常，请稍后再试。';
  }
  
  // Default fallback
  return message || '发生未知错误，请稍后重试。';
};

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const supabase = createClient();
  
  // Modal state management
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // Reset form and view when modal opens/closes
  const handleClose = () => {
    setView('login');
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  // Client-side validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): { isValid: boolean; message?: string } => {
    if (!formData.email || !formData.password) {
      return { isValid: false, message: '邮箱和密码为必填项' };
    }

    if (!validateEmail(formData.email)) {
      return { isValid: false, message: '请输入有效的邮箱地址' };
    }

    if (view === 'register') {
      if (!formData.name.trim()) {
        return { isValid: false, message: '姓名为必填项' };
      }
      
      if (formData.password.length < 8) {
        return { isValid: false, message: '密码长度至少8位' };
      }
      
      if (formData.password !== formData.confirmPassword) {
        return { isValid: false, message: '两次输入的密码不一致' };
      }
    }

    return { isValid: true };
  };

  // Registration handler
  const handleRegister = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: '验证失败',
        description: validation.message,
        variant: 'destructive',
      });
      return;
    }

    // 追踪注册尝试
    trackAuth('register_attempt', { email: formData.email });

    setIsLoading(true);

    try {
      // Call Supabase signUp - this will send verification email if SMTP is configured
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${process.env.NODE_ENV === 'production' ? 'https://artisans-ai.com' : window.location.origin}/auth/confirm?next=/`,
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // 追踪注册成功
      trackAuth('register_success', { email: formData.email, userId: data.user?.id });

      // Show success toast - user must verify email before login
      toast({
        title: t?.auth?.register_success || '注册成功',
        description: t?.auth?.register_success_message || '账户已注册，请前往邮箱验证以完成注册。如果看到长链接，请点击"申请恢复"或复制链接到浏览器。',
        variant: 'default',
      });

      // Reset form and switch to login view
      setFormData({ email: '', password: '', confirmPassword: '', name: '' });
      setView('login');

    } catch (error) {
      // 追踪注册失败
      trackAuth('register_error', { 
        email: formData.email, 
        error: error instanceof Error ? error.message : 'unknown' 
      });

      toast({
        title: '注册失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: '验证失败',
        description: validation.message,
        variant: 'destructive',
      });
      return;
    }

    // 追踪登录尝试
    trackAuth('login_attempt', { email: formData.email });

    setIsLoading(true);

    try {
      // Call Supabase signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      // 追踪登录成功
      trackAuth('login_success', { 
        email: formData.email, 
        userId: data.user?.id,
        userEmail: data.user?.email 
      });

      // Login successful
      toast({
        title: '登录成功',
        description: '欢迎回来！',
        variant: 'default',
      });

      handleClose();
      onSuccess?.();

    } catch (error) {
      // 追踪登录失败
      trackAuth('login_error', { 
        email: formData.email, 
        error: error instanceof Error ? error.message : 'unknown' 
      });

      toast({
        title: '登录失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification handler
  const handleResendVerification = async () => {
    if (!formData.email) {
      toast({
        title: '验证失败',
        description: '请输入邮箱地址',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Try to resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: '邮件已发送',
        description: '验证邮件已重新发送，请检查您的邮箱',
        variant: 'default',
      });

    } catch (error) {
      toast({
        title: '发送失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Password reset handler
  const handlePasswordReset = async () => {
    if (!formData.email) {
      toast({
        title: '验证失败',
        description: '请输入邮箱地址',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase resetPasswordForEmail
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: '邮件已发送',
        description: '重置密码邮件已发送，请前往邮箱完成操作',
        variant: 'default',
      });

      // Switch back to login view
      setView('login');

    } catch (error) {
      toast({
        title: '发送失败',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <DialogHeader>
          <DialogTitle>
            {view === 'login' && (t?.auth?.signIn?.title || '登录')}
            {view === 'register' && (t?.auth?.signUp?.title || '注册')}
            {view === 'reset' && '重置密码'}
          </DialogTitle>
          <DialogDescription>
            {view === 'login' && (t?.auth?.signIn?.description || '登录到您的账户')}
            {view === 'register' && (t?.auth?.signUp?.description || '创建新账户')}
            {view === 'reset' && '输入您的邮箱地址，我们将发送重置密码的链接'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name field (only for register) */}
          {view === 'register' && (
            <div>
              <Label htmlFor="name">姓名</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t?.auth?.namePlaceholder || '请输入您的姓名'}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t?.auth?.emailPlaceholder || '请输入邮箱地址'}
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password fields (not for reset) */}
          {view !== 'reset' && (
            <>
              <div>
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t?.auth?.passwordPlaceholder || '请输入密码'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirm password (only for register) */}
              {view === 'register' && (
                <div>
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t?.auth?.confirmPasswordPlaceholder || '请再次输入密码'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit button */}
          <Button
            onClick={view === 'login' ? handleLogin : view === 'register' ? handleRegister : handlePasswordReset}
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {view === 'login' && (t?.auth?.signIn?.loading || 'Signing in...')}
                {view === 'register' && (t?.auth?.signUp?.loading || 'Signing up...')}
                {view === 'reset' && (t?.auth?.reset?.loading || 'Sending...')}
              </>
            ) : (
              <>
                {view === 'login' && (t?.auth?.signIn?.button || 'Sign In')}
                {view === 'register' && (t?.auth?.signUp?.button || 'Sign Up')}
                {view === 'reset' && (t?.auth?.reset?.button || 'Send Reset Email')}
              </>
            )}
          </Button>

          {/* Resend verification button (only for register success) */}
          {view === 'register' && (
            <Button
              onClick={handleResendVerification}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {t?.auth?.resend_verification || 'Resend Verification Email'}
            </Button>
          )}

          {/* Navigation links */}
          <div className="space-y-2 text-center">
            {view === 'login' && (
              <>
                <Button
                  variant="link"
                  onClick={() => setView('register')}
                  className="text-muted-foreground hover:text-primary"
                >
                  没有账号？注册
                </Button>
                <Button
                  variant="link"
                  onClick={() => setView('reset')}
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  忘记密码？
                </Button>
              </>
            )}
            
            {view === 'register' && (
              <Button
                variant="link"
                onClick={() => setView('login')}
                className="text-muted-foreground hover:text-primary"
              >
                已有账号？登录
              </Button>
            )}
            
            {view === 'reset' && (
              <Button
                variant="link"
                onClick={() => setView('login')}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                返回登录
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
