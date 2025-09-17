'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LightRays from '@/components/light-rays';

export default function TermsPage() {
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
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
                  <p>
                    By accessing and using ArtisanAI, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. Use License</h2>
                  <p>
                    Permission is granted to temporarily use ArtisanAI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose or for any public display</li>
                    <li>attempt to reverse engineer any software contained on the website</li>
                    <li>remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. AI Generated Content</h2>
                  <p>
                    ArtisanAI uses artificial intelligence to generate images. Users are responsible for ensuring their use of generated content complies with applicable laws and regulations. We do not guarantee the accuracy, appropriateness, or legality of AI-generated content.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. User Content</h2>
                  <p>
                    You retain ownership of any content you upload to ArtisanAI. By uploading content, you grant us a license to use, process, and display your content for the purpose of providing our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Prohibited Uses</h2>
                  <p>You may not use ArtisanAI:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>To submit false or misleading information</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Service Availability</h2>
                  <p>
                    We strive to maintain high service availability but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue the service at any time.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
                  <p>
                    In no event shall ArtisanAI or its suppliers be liable for any damages arising out of the use or inability to use the materials on ArtisanAI, even if ArtisanAI or an authorized representative has been notified orally or in writing of the possibility of such damage.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Information</h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us at: <a href="mailto:jdfz13zqy@gmail.com" className="text-primary hover:underline">jdfz13zqy@gmail.com</a>
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
