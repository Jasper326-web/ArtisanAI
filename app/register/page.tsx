'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { createClient } from '@/lib/supabase-client';
import LightRays from '@/components/light-rays';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError(t?.auth?.errors?.required || 'Email, password and name are required');
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call Supabase signUp with email redirect
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/welcome`,
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        // Show success message - user needs to verify email
        setSuccess(t?.auth?.signUp?.confirmEmail || '账户已注册，请前往邮箱验证以完成注册');
        
        // Clear form after successful registration
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
        });
      }
    } catch (err) {
      setError(t?.auth?.errors?.generic || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError(t?.auth?.errors?.emailRequired || 'Email is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Resend verification by calling signUp again with the same email
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: 'dummy_password', // This won't be used since user already exists
        options: {
          emailRedirectTo: `${window.location.origin}/welcome`,
        },
      });

      if (error && error.message.includes('already registered')) {
        // User already exists, send resend confirmation
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: formData.email,
          options: {
            emailRedirectTo: `${window.location.origin}/welcome`,
          },
        });

        if (resendError) {
          setError(resendError.message);
        } else {
          setSuccess('Verification email sent! Please check your inbox.');
        }
      } else if (error) {
        setError(error.message);
      } else {
        setSuccess('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError(t?.auth?.errors?.generic || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <LightRays />
      </div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-card/40 border border-primary/20 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              {t?.auth?.signUp?.title || 'Create Account'}
            </CardTitle>
            <CardDescription>
              {t?.auth?.signUp?.description || 'Create a new account to get started'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
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

            {/* Registration Form */}
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <Label htmlFor="name">
                  {t?.auth?.name || 'Full Name'}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t?.auth?.namePlaceholder || 'Enter your full name'}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email">
                  {t?.auth?.email || 'Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t?.auth?.emailPlaceholder || 'Enter your email'}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <Label htmlFor="password">
                  {t?.auth?.password || 'Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
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

              {/* Confirm Password Field */}
              <div>
                <Label htmlFor="confirmPassword">
                  {t?.auth?.confirmPassword || 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
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

              {/* Register Button */}
              <Button
                onClick={handleRegister}
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

              {/* Resend Verification Button */}
              {success && success.includes('邮箱验证') && (
                <Button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              )}

              {/* Back to Login */}
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => router.push('/')}
                  className="text-muted-foreground hover:text-primary"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
