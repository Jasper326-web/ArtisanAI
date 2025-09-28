'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/hooks/use-toast';
import LightRays from '@/components/light-rays';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Check if user has valid session (came from password reset email)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          toast({
            title: '会话无效',
            description: '请重新申请密码重置',
            variant: 'destructive',
          });
          router.push('/');
          return;
        }

        if (session) {
          setIsSessionValid(true);
        } else {
          toast({
            title: '会话已过期',
            description: '请重新申请密码重置',
            variant: 'destructive',
          });
          router.push('/');
        }
      } catch (err) {
        console.error('Session check exception:', err);
        toast({
          title: '验证失败',
          description: '请重新申请密码重置',
          variant: 'destructive',
        });
        router.push('/');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [supabase, router, toast]);

  const validateForm = (): { isValid: boolean; message?: string } => {
    if (!formData.password || !formData.confirmPassword) {
      return { isValid: false, message: '请填写所有字段' };
    }

    if (formData.password.length < 8) {
      return { isValid: false, message: '密码长度至少8位' };
    }

    if (formData.password !== formData.confirmPassword) {
      return { isValid: false, message: '两次输入的密码不一致' };
    }

    return { isValid: true };
  };

  const handleUpdatePassword = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      toast({
        title: '验证失败',
        description: validation.message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call Supabase updateUser to set new password
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        throw error;
      }

      // Success
      toast({
        title: '密码更新成功',
        description: '您的密码已成功更新，请使用新密码登录',
        variant: 'default',
      });

      // Redirect to login page
      router.push('/');

    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error?.message || '密码更新失败，请重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <LightRays />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">验证会话中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSessionValid) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <LightRays />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Card className="w-full max-w-md backdrop-blur-xl bg-card/40 border border-primary/20 shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                会话无效
              </CardTitle>
              <CardDescription>
                请重新申请密码重置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                返回首页
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <LightRays />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-card/40 border border-primary/20 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              设置新密码
            </CardTitle>
            <CardDescription>
              请输入您的新密码
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Password field */}
            <div>
              <Label htmlFor="password">新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入新密码（至少8位）"
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

            {/* Confirm password field */}
            <div>
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="请再次输入新密码"
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

            {/* Update button */}
            <Button
              onClick={handleUpdatePassword}
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  更新中...
                </>
              ) : (
                '更新密码'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>密码更新后，您将需要使用新密码登录</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
