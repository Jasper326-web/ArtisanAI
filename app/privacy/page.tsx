'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';
import { useLanguage } from '@/contexts/language-context';

export default function PrivacyPage() {
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
                {t?.legal?.privacy?.title || 'Privacy Policy'}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-8 text-muted-foreground">
                {/* Introduction */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.introduction?.title || '1. Introduction'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.introduction?.content || 'This Privacy Policy describes how ArtisanAI collects, uses, and protects your personal information.'}</p>
                </div>

                {/* Information Collection */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.information_collection?.title || '2. Information We Collect'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.information_collection?.content || 'We collect information you provide directly to us, such as when you create an account, upload images, or contact us.'}</p>
                </div>

                {/* Usage Information */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.usage_information?.title || '3. Usage Information'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.usage_information?.content || 'We automatically collect certain information about your use of our services, including device information, IP address, and usage patterns.'}</p>
                </div>

                {/* Cookies */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.cookies?.title || '4. Cookies and Tracking'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.cookies?.content || 'We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.'}</p>
                </div>

                {/* Data Usage */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.data_usage?.title || '5. How We Use Your Information'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.data_usage?.content || 'We use your information to provide, maintain, and improve our services, process transactions, and ensure platform security.'}</p>
                </div>

                {/* Data Sharing */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.data_sharing?.title || '6. Information Sharing'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.data_sharing?.content || 'We do not sell your personal information. We may share your information with service providers or when required by law.'}</p>
                </div>

                {/* Data Security */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.data_security?.title || '7. Data Security'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.data_security?.content || 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'}</p>
                </div>

                {/* Data Retention */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.data_retention?.title || '8. Data Retention'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.data_retention?.content || 'We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy.'}</p>
                </div>

                {/* Your Rights */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.your_rights?.title || '9. Your Rights'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.your_rights?.content || 'You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.'}</p>
                </div>

                {/* Children's Privacy */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.children_privacy?.title || '10. Children\'s Privacy'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.children_privacy?.content || 'Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.'}</p>
                </div>

                {/* International Transfers */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.international_transfers?.title || '11. International Data Transfers'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.international_transfers?.content || 'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.'}</p>
                </div>

                {/* Policy Changes */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.policy_changes?.title || '12. Changes to This Policy'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.policy_changes?.content || 'We may update this Privacy Policy from time to time. We will notify you of any material changes through our platform or by email.'}</p>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.privacy?.sections?.contact?.title || '13. Contact Us'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.privacy?.sections?.contact?.content || 'If you have any questions about this Privacy Policy, please contact us at jdfz13zqy@gmail.com.'}</p>
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
