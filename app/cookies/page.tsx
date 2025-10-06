'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';
import { useLanguage } from '@/contexts/language-context';

export default function CookiesPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen relative">
      {/* Prism Background */}
      <div className="fixed inset-0 z-0">
        <LightRays />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <Card className="backdrop-blur-xl bg-card/30 border border-primary/30 shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-foreground mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                {t?.legal?.cookies?.title || 'Cookie Policy'}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-8 text-muted-foreground">
                {/* Introduction */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.introduction?.title || '1. What Are Cookies'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.introduction?.content || 'Cookies are small text files that are stored on your device when you visit our website.'}</p>
                </div>

                {/* Types of Cookies */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.types_of_cookies?.title || '2. Types of Cookies We Use'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.types_of_cookies?.content || 'We use essential cookies for website functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings.'}</p>
                </div>

                {/* Essential Cookies */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.essential_cookies?.title || '3. Essential Cookies'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.essential_cookies?.content || 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and authentication.'}</p>
                </div>

                {/* Analytics Cookies */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.analytics_cookies?.title || '4. Analytics Cookies'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.analytics_cookies?.content || 'We use analytics cookies to understand how visitors interact with our website, helping us improve performance and user experience.'}</p>
                </div>

                {/* Preference Cookies */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.preference_cookies?.title || '5. Preference Cookies'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.preference_cookies?.content || 'These cookies remember your choices and preferences, such as language settings, to provide a personalized experience on future visits.'}</p>
                </div>

                {/* Third-Party Cookies */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.third_party_cookies?.title || '6. Third-Party Cookies'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.third_party_cookies?.content || 'Some cookies are set by third-party services we use, such as analytics providers. These help us understand user behavior and improve our services.'}</p>
                </div>

                {/* Cookie Management */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.cookie_management?.title || '7. Managing Cookies'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.cookie_management?.content || 'You can control cookies through your browser settings. You can delete existing cookies and choose to block future cookies, though this may affect website functionality.'}</p>
                </div>

                {/* Browser Settings */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.browser_settings?.title || '8. Browser Settings'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.browser_settings?.content || 'Most browsers allow you to refuse cookies or delete them. Please refer to your browser\'s help documentation for specific instructions on cookie management.'}</p>
                </div>

                {/* Cookie Consent */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.cookie_consent?.title || '9. Cookie Consent'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.cookie_consent?.content || 'By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw consent at any time through your browser settings.'}</p>
                </div>

                {/* Updates */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.updates?.title || '10. Updates to This Policy'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.updates?.content || 'We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.'}</p>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.cookies?.sections?.contact?.title || '11. Contact Us'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.cookies?.sections?.contact?.content || 'If you have questions about our use of cookies, please contact us at jdfz13zqy@gmail.com.'}</p>
                </div>

                <div className="text-sm text-muted-foreground mt-8 pt-6 border-t border-primary/20">
                  <p>{t?.legal?.common?.last_updated || '最后更新:'} {t?.legal?.common?.date || 'December 2024'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
