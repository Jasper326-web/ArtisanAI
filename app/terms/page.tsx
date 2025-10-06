'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';
import { useLanguage } from '@/contexts/language-context';

export default function TermsPage() {
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
                {t?.legal?.terms?.title || 'Terms of Service'}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-8 text-muted-foreground">
                {/* Introduction */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.introduction?.title || '1. Introduction'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.introduction?.content || 'Welcome to ArtisanAI. These Terms of Service govern your use of our AI-powered image generation platform.'}</p>
                </div>

                {/* Acceptance of Terms */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.acceptance?.title || '2. Acceptance of Terms'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.acceptance?.content || 'By using ArtisanAI, you acknowledge that you have read, understood, and agree to be bound by these Terms.'}</p>
                </div>

                {/* Description of Services */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.services?.title || '3. Description of Services'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.services?.content || 'ArtisanAI provides AI-powered image generation services, including character consistency, 3D figurine generation, and style transformation.'}</p>
                </div>

                {/* User Accounts */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.user_accounts?.title || '4. User Accounts'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.user_accounts?.content || 'To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials.'}</p>
                </div>

                {/* Acceptable Use */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.acceptable_use?.title || '5. Acceptable Use'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.acceptable_use?.content || 'You agree to use our services only for lawful purposes and in accordance with these Terms.'}</p>
                </div>

                {/* Intellectual Property */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.intellectual_property?.title || '6. Intellectual Property'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.intellectual_property?.content || 'The ArtisanAI platform is protected by intellectual property laws. You retain ownership of content you generate.'}</p>
                </div>

                {/* Privacy */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.privacy?.title || '7. Privacy'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.privacy?.content || 'Your privacy is important to us. Please review our Privacy Policy to understand our practices.'}</p>
                </div>

                {/* Payment and Billing */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.payment?.title || '8. Payment and Billing'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.payment?.content || 'Certain features of our service require payment. All fees are non-refundable unless otherwise stated.'}</p>
                </div>

                {/* Termination */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.termination?.title || '9. Termination'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.termination?.content || 'We may terminate or suspend your account at our sole discretion for conduct that violates these Terms.'}</p>
                </div>

                {/* Disclaimers */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.disclaimers?.title || '10. Disclaimers'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.disclaimers?.content || 'Our services are provided "as is" without warranties of any kind.'}</p>
                </div>

                {/* Limitation of Liability */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.limitation?.title || '11. Limitation of Liability'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.limitation?.content || 'To the maximum extent permitted by law, ArtisanAI shall not be liable for any indirect damages.'}</p>
                </div>

                {/* Changes to Terms */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.changes?.title || '12. Changes to Terms'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.changes?.content || 'We reserve the right to modify these Terms at any time with reasonable notice.'}</p>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.terms?.sections?.contact?.title || '13. Contact Information'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.terms?.sections?.contact?.content || 'If you have any questions about these Terms, please contact us at jdfz13zqy@gmail.com.'}</p>
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
