'use client';

import React from 'react';
import { ContactForm } from '@/components/contact-form';
import LightRays from '@/components/light-rays';
import { useLanguage } from '@/contexts/language-context';

export default function ContactPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <LightRays />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              {t?.contact?.title || '联系我们'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t?.contact?.subtitle || '对Artisan AI有疑问？想要合作或需要支持？我们很乐意听到您的声音。发送消息给我们，我们将在24小时内回复。'}
            </p>
          </div>

          <ContactForm />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 backdrop-blur-xl bg-card/30 border border-primary/20 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t?.contact?.email_us || '邮件联系'}</h3>
              <p className="text-sm text-muted-foreground">jdfz13zqy@gmail.com</p>
            </div>

            <div className="text-center p-6 backdrop-blur-xl bg-card/30 border border-primary/20 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t?.contact?.response_time || '回复时间'}</h3>
              <p className="text-sm text-muted-foreground">{t?.contact?.within_24h || '24小时内'}</p>
            </div>

            <div className="text-center p-6 backdrop-blur-xl bg-card/30 border border-primary/20 rounded-lg">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t?.contact?.support || '支持'}</h3>
              <p className="text-sm text-muted-foreground">{t?.contact?.support_scope || '技术 & 通用'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

