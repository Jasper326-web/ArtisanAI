'use client';

import React from 'react';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import LightRays from '@/components/light-rays';
import Link from 'next/link';

export default function AuthCodeErrorPage() {
  const { t } = useLanguage();

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
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {t?.auth?.verification_error || '验证失败'}
            </CardTitle>
            <CardDescription>
              {t?.auth?.verification_error_message || '邮箱验证链接无效或已过期。请检查链接是否正确，或重新发送验证邮件。'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {t?.auth?.verification_error_help || '可能的原因：链接已过期、已被使用，或格式不正确。'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/40 transition-all active:scale-95"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t?.auth?.retry_verification || '重新验证'}
              </Button>

              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-primary/20 hover:border-primary/40 transition-all"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t?.auth?.back_to_home || '返回首页'}
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>{t?.auth?.verification_help || '如果您持续遇到问题，请联系客服或重新注册账户。'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
