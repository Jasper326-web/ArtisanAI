'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiesPage() {
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
                Cookie Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <div className="space-y-6 text-muted-foreground">
                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies</h2>
                  <p>
                    Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                    They are widely used to make websites work more efficiently and to provide information to website owners.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Cookies</h2>
                  <p>ArtisanAI uses cookies for the following purposes:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>To remember your preferences and settings</li>
                    <li>To keep you signed in to your account</li>
                    <li>To analyze how you use our website</li>
                    <li>To improve our services and user experience</li>
                    <li>To provide personalized content and features</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">3. Types of Cookies We Use</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Essential Cookies</h3>
                      <p>
                        These cookies are necessary for the website to function properly. They enable basic functions like page navigation, 
                        access to secure areas, and remembering your login status.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Performance Cookies</h3>
                      <p>
                        These cookies collect information about how visitors use our website, such as which pages are visited most often. 
                        This helps us improve how our website works.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Functionality Cookies</h3>
                      <p>
                        These cookies allow the website to remember choices you make and provide enhanced, more personal features.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Analytics Cookies</h3>
                      <p>
                        We use analytics cookies to understand how visitors interact with our website. This helps us improve our services 
                        and user experience.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Cookies</h2>
                  <p>
                    Some cookies on our website are set by third-party services. These may include:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Google Analytics for website analytics</li>
                    <li>Payment processors for transaction security</li>
                    <li>Authentication providers for user login</li>
                    <li>Content delivery networks for faster loading</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">5. Managing Cookies</h2>
                  <p>You can control and manage cookies in several ways:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Browser Settings</h3>
                      <p>
                        Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies 
                        or delete certain cookies.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Cookie Consent</h3>
                      <p>
                        When you first visit our website, you may see a cookie consent banner. You can choose which types of cookies 
                        you want to accept.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">6. Impact of Disabling Cookies</h2>
                  <p>
                    If you choose to disable cookies, some features of our website may not function properly. This may include:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Difficulty staying logged in to your account</li>
                    <li>Loss of personalized settings and preferences</li>
                    <li>Reduced functionality of interactive features</li>
                    <li>Inability to save your work or progress</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">7. Cookie Retention</h2>
                  <p>
                    Different cookies have different retention periods:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Session cookies are deleted when you close your browser</li>
                    <li>Persistent cookies remain on your device for a set period</li>
                    <li>Some cookies may be refreshed when you visit our website again</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">8. Updates to This Policy</h2>
                  <p>
                    We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, 
                    legal, or regulatory reasons.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact Us</h2>
                  <p>
                    If you have any questions about our use of cookies, please contact us at: 
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
