'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-client';
import LightRays from '@/components/light-rays';
import { useLanguage } from '@/contexts/language-context';

export default function EmailVerifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if there are URL parameters indicating email verification
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session from URL parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session setting error:', error);
            setError(t?.auth?.verification_error || '邮箱验证过程中出现错误，请重试');
            return;
          }

          if (data.session) {
            setIsVerified(true);
            // 自动重定向到首页，用户已登录
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        } else {
          // No verification parameters found, try to get current session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsVerified(true);
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setError(t?.auth?.verification_not_found || '未找到验证信息，请检查邮件链接是否正确');
          }
        }
      } catch (err) {
        console.error('Email verification error:', err);
        setError(t?.auth?.verification_error || '邮箱验证过程中出现错误，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    handleEmailVerification();
  }, [searchParams, supabase, router, t]);

  const handleGoToLogin = () => {
    // Clear any existing session to ensure fresh login
    supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <LightRays />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t?.auth?.verifying || '验证中...'}</p>
          </div>
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
              {isVerified ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 text-2xl">✗</span>
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isVerified ? (t?.auth?.verification_success || '邮箱验证成功') : (t?.auth?.verification_failed || '验证失败')}
            </CardTitle>
            <CardDescription>
              {isVerified 
                ? (t?.auth?.verification_success_message || '您的邮箱已成功验证，正在自动登录...') 
                : error || (t?.auth?.verification_failed_message || '邮箱验证失败，请检查链接是否正确')
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isVerified && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 dark:text-green-200 text-sm">
                    {t?.auth?.verification_complete || '验证成功！您现在可以正常登录了。'}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t?.auth?.back_to_login || '返回登录页面'}
              </Button>

              {!isVerified && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  {t?.auth?.retry_verification || '重新验证'}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>{t?.auth?.verification_help || '如果您遇到问题，请联系客服或重新注册账户'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
