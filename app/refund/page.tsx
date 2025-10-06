'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';
import { useLanguage } from '@/contexts/language-context';

export default function RefundPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen relative">
      {/* Light Rays Background */}
      <div className="fixed inset-0 z-[1]">
        <LightRays />
      </div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <Card className="backdrop-blur-xl bg-card/30 border border-primary/30 shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-foreground mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                {t?.legal?.refund?.title || 'Refund Policy'}
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-8 text-muted-foreground">
                {/* Introduction */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.introduction?.title || '1. Refund Policy Overview'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.introduction?.content || 'This Refund Policy outlines the terms and conditions for refunds on ArtisanAI services. Please read this policy carefully before making a purchase.'}</p>
                </div>

                {/* Refund Eligibility */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.refund_eligibility?.title || '2. Refund Eligibility'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.refund_eligibility?.content || 'Refunds may be considered for technical issues that prevent service delivery, billing errors, or duplicate charges. Refunds are not available for completed AI generation services.'}</p>
                </div>

                {/* Technical Issues */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.technical_issues?.title || '3. Technical Issues'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.technical_issues?.content || 'If you experience technical problems that prevent you from using our services, please contact our support team within 7 days of the issue occurring. We will investigate and may provide a refund or credit.'}</p>
                </div>

                {/* Billing Errors */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.billing_errors?.title || '4. Billing Errors'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.billing_errors?.content || 'If you believe you have been charged incorrectly, please contact us immediately. We will review the charge and provide a refund if an error is confirmed.'}</p>
                </div>

                {/* Service Quality */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.service_quality?.title || '5. Service Quality Issues'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.service_quality?.content || 'If you are dissatisfied with the quality of AI-generated content, please contact support within 24 hours. We may offer credits or re-generation of content.'}</p>
                </div>

                {/* Refund Process */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.refund_process?.title || '6. Refund Process'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.refund_process?.content || 'To request a refund, contact us at jdfz13zqy@gmail.com with your order details and reason for the refund request. We will respond within 2-3 business days.'}</p>
                </div>

                {/* Processing Time */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.processing_time?.title || '7. Processing Time'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.processing_time?.content || 'Approved refunds will be processed within 5-10 business days. The refund will be credited to the original payment method used for the purchase.'}</p>
                </div>

                {/* Non-Refundable */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.non_refundable?.title || '8. Non-Refundable Items'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.non_refundable?.content || 'The following are not eligible for refunds: completed AI generation services, credits that have been used, and purchases made more than 30 days ago.'}</p>
                </div>

                {/* Credit Alternatives */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.credit_alternatives?.title || '9. Credit Alternatives'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.credit_alternatives?.content || 'In some cases, we may offer account credits instead of refunds. Credits can be used for future purchases and do not expire.'}</p>
                </div>

                {/* Chargebacks */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.chargebacks?.title || '10. Chargebacks'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.chargebacks?.content || 'If you initiate a chargeback with your bank, please contact us first to resolve the issue. Unnecessary chargebacks may result in account suspension.'}</p>
                </div>

                {/* Policy Changes */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.policy_changes?.title || '11. Policy Changes'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.policy_changes?.content || 'We reserve the right to modify this refund policy at any time. Changes will be posted on this page and will apply to future purchases.'}</p>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{t?.legal?.refund?.sections?.contact?.title || '12. Contact Us'}</h2>
                  <p className="text-base leading-relaxed">{t?.legal?.refund?.sections?.contact?.content || 'For refund requests or questions about this policy, please contact us at jdfz13zqy@gmail.com.'}</p>
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
