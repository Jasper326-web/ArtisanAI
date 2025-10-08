'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/language-context';
import { supabase } from '@/lib/supabase-client';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // 使用全局单例，避免创建多个 GoTrueClient 实例

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForm();
    setActiveTab('signin');
    onClose();
  };

  const validateForm = (isSignUp: boolean = false) => {
    if (!formData.email || !formData.password) {
      setError(t?.auth?.errors?.required || 'Email and password are required');
      return false;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        setError(t?.auth?.errors?.nameRequired || 'Name is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(t?.auth?.errors?.passwordMismatch || 'Passwords do not match');
        return false;
      }

      if (formData.password.length < 6) {
        setError(t?.auth?.errors?.passwordLength || 'Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(t?.auth?.signIn?.success || 'Signed in successfully!');
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 1500);
      }
    } catch (err) {
      setError(t?.auth?.errors?.generic || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm(true)) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        if (data.user && !data.user.email_confirmed_at) {
          setSuccess(t?.auth?.signUp?.confirmEmail || 'Please check your email to confirm your account');
        } else {
          setSuccess(t?.auth?.signUp?.success || 'Account created successfully!');
          setTimeout(() => {
            handleClose();
            onSuccess?.();
          }, 1500);
        }
      }
    } catch (err) {
      setError(t?.auth?.errors?.generic || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError(t?.auth?.errors?.emailRequired || 'Email is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(t?.auth?.forgotPassword?.success || 'Password reset email sent!');
      }
    } catch (err) {
      setError(t?.auth?.errors?.generic || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(t?.auth?.errors?.generic || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl shadow-2xl shadow-primary/10">
        <DialogHeader>
          <DialogTitle>
            {activeTab === 'signin' && (t?.auth?.signIn?.title || 'Sign In')}
            {activeTab === 'signup' && (t?.auth?.signUp?.title || 'Create Account')}
          </DialogTitle>
          <DialogDescription>
            {activeTab === 'signin' && (t?.auth?.signIn?.description || 'Sign in to your account')}
            {activeTab === 'signup' && (t?.auth?.signUp?.description || 'Create a new account')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">
              {t?.auth?.signIn?.tab || 'Sign In'}
            </TabsTrigger>
            <TabsTrigger value="signup">
              {t?.auth?.signUp?.tab || 'Sign Up'}
            </TabsTrigger>
          </TabsList>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {/* Sign In Tab */}
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signin-email">
                  {t?.auth?.email || 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder={t?.auth?.emailPlaceholder || 'Enter your email'}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signin-password">
                  {t?.auth?.password || 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t?.auth?.passwordPlaceholder || 'Enter your password'}
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

              <Button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t?.auth?.signIn?.loading || 'Signing in...'}
                  </>
                ) : (
                  t?.auth?.signIn?.button || 'Sign In'
                )}
              </Button>

              {/* Inline forgot password link under Sign In */}
              <div className="text-xs text-muted-foreground mt-1">
                {t?.auth?.forgotPassword?.description || 'Forgot your password?'}
                {" "}
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-primary underline-offset-4 hover:underline ml-1"
                >
                  {t?.auth?.forgotPassword?.tab || 'Reset now'}
                </button>
              </div>
            </div>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="signup-name">
                  {t?.auth?.name || 'Full Name'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t?.auth?.namePlaceholder || 'Enter your full name'}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-email">
                  {t?.auth?.email || 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t?.auth?.emailPlaceholder || 'Enter your email'}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="signup-password">
                  {t?.auth?.password || 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t?.auth?.passwordPlaceholder || 'Enter your password'}
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

              <div>
                <Label htmlFor="signup-confirm-password">
                  {t?.auth?.confirmPassword || 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t?.auth?.confirmPasswordPlaceholder || 'Confirm your password'}
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

              <Button
                onClick={handleSignUp}
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {t?.auth?.signUp?.loading || 'Creating account...'}
                  </>
                ) : (
                  t?.auth?.signUp?.button || 'Create Account'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* OAuth Sign In */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t?.auth?.or || 'Or continue with'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="group relative w-full h-12 rounded-xl bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* 背景渐变效果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* 微妙的边框光效 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Google图标容器 */}
            <div className="relative z-10 flex items-center justify-center w-full">
              <div className="flex items-center justify-center w-5 h-5 mr-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              
              {/* 文本 */}
              <span className="font-medium text-sm group-hover:text-blue-700 transition-colors duration-300">
                {t?.auth?.google || 'Continue with Google'}
              </span>
            </div>
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* 点击波纹效果 */}
            <div className="absolute inset-0 rounded-xl bg-blue-500/20 scale-0 group-active:scale-100 transition-transform duration-150"></div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
