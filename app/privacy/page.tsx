'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';

export default function PrivacyPage() {
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
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                  <p>We collect information you provide directly to us, such as when you:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Create an account or profile</li>
                    <li>Upload images or content</li>
                    <li>Make purchases or transactions</li>
                    <li>Contact us for support</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. AI Processing and Image Data</h2>
                  <p>
                    When you upload images to ArtisanAI, we process them using artificial intelligence to generate new content. 
                    Your uploaded images are processed securely and temporarily. We do not store your uploaded images or generated results on our servers.
                    All generated images are provided to you for immediate download and are not retained by our system.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Information Sharing</h2>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>To trusted service providers who assist us in operating our website</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or acquisition</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Security</h2>
                  <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, 
                    alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies and Tracking</h2>
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our website. 
                    You can control cookie settings through your browser preferences or our cookie consent banner.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights (GDPR/CCPA)</h2>
                  <p>You have the following rights regarding your personal data:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                    <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                    <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                    <li><strong>Restriction:</strong> Limit how we process your data</li>
                    <li><strong>Objection:</strong> Object to certain types of data processing</li>
                  </ul>
                  <p className="mt-2">
                    To exercise these rights, contact us at privacy@artisans-ai.com. 
                    We will respond within 30 days.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Data Retention</h2>
                  <p>
                    We retain your personal data only as long as necessary to provide our services 
                    and comply with legal obligations. Account data is retained until you delete 
                    your account, and transaction data is retained for 7 years for tax purposes.
                    Uploaded images and generated content are not stored and are processed only temporarily.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Third-Party Services</h2>
                  <p>
                    Our service may contain links to third-party websites or services. We are not responsible for the privacy 
                    practices of these third parties. We encourage you to read their privacy policies.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Children's Privacy</h2>
                  <p>
                    Our service is not intended for children under 13. We do not knowingly collect personal information 
                    from children under 13. If you are a parent and believe your child has provided us with personal information, 
                    please contact us.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Your Rights</h2>
                  <p>You have the right to:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                    <li>Opt-out of certain communications</li>
                    <li>Data portability</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting 
                    the new policy on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at: 
                    <a href="mailto:jdfz13zqy@gmail.com" className="text-primary hover:underline">jdfz13zqy@gmail.com</a>
                  </p>
                </section>

                <div className="text-sm text-muted-foreground mt-8 pt-6 border-t border-primary/20">
                  <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
