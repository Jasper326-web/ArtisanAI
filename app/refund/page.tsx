'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';

export default function RefundPage() {
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
                Refund Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Refund Eligibility</h2>
                  <p>
                    We offer refunds for credit purchases under the following circumstances:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Technical issues preventing service usage within 24 hours of purchase</li>
                    <li>Duplicate purchases made in error</li>
                    <li>Service unavailability for more than 48 hours</li>
                    <li>Billing errors on our part</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Refund Timeframe</h2>
                  <p>
                    Refund requests must be submitted within 30 days of the original purchase date. 
                    Refunds will be processed within 5-10 business days after approval.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Non-Refundable Items</h2>
                  <p>The following are not eligible for refunds:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Credits that have been used to generate images</li>
                    <li>Purchases made more than 30 days ago</li>
                    <li>Refunds requested due to dissatisfaction with generated content quality</li>
                    <li>Refunds for unused credits after 90 days of inactivity</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. How to Request a Refund</h2>
                  <p>To request a refund, please:</p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Contact our support team at support@artisans-ai.com</li>
                    <li>Include your order number and reason for refund</li>
                    <li>Provide any relevant screenshots or documentation</li>
                    <li>Allow 2-3 business days for review</li>
                  </ol>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Refund Processing</h2>
                  <p>
                    Approved refunds will be processed to the original payment method used for the purchase. 
                    Processing times may vary depending on your payment provider:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Credit/Debit Cards: 5-10 business days</li>
                    <li>PayPal: 3-5 business days</li>
                    <li>Bank Transfers: 7-14 business days</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Partial Refunds</h2>
                  <p>
                    In cases where only some credits have been used, we may offer partial refunds 
                    for the unused portion. The refund amount will be calculated based on the 
                    original purchase price and remaining credit balance.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Dispute Resolution</h2>
                  <p>
                    If you are not satisfied with our refund decision, you may contact us to 
                    discuss alternative solutions. We are committed to resolving all customer 
                    concerns fairly and promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Information</h2>
                  <p>
                    For refund requests or questions about this policy, please contact us:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Email: support@artisans-ai.com</li>
                    <li>Response Time: Within 24 hours</li>
                    <li>Business Hours: Monday - Friday, 9 AM - 6 PM (UTC)</li>
                  </ul>
                </section>

                <div className="mt-8 p-4 bg-muted/20 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This refund policy is subject to change. We will notify users of any 
                    significant changes via email or website notification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
