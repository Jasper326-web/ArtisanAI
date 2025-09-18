'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Cookie, Settings } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // 必需cookie，不可关闭
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // 检查是否已经同意过cookie
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allConsent));
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const consent = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const consent = {
      necessary: true, // 必需cookie
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="backdrop-blur-xl bg-card/95 border border-primary/30 shadow-2xl shadow-primary/10">
        <CardContent className="p-4">
          {!showSettings ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    Cookie 设置
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    我们使用 Cookie 来改善您的体验、分析网站使用情况并提供个性化内容。
                    点击"接受全部"即表示您同意我们使用所有 Cookie。
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  自定义设置
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="flex-1"
                >
                  拒绝全部
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="flex-1"
                >
                  接受全部
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Cookie 偏好设置</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">必需 Cookie</p>
                    <p className="text-xs text-muted-foreground">
                      网站正常运行所必需的 Cookie
                    </p>
                  </div>
                  <div className="w-10 h-5 bg-primary rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">分析 Cookie</p>
                    <p className="text-xs text-muted-foreground">
                      帮助我们了解网站使用情况
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                    className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics ? 'bg-primary justify-end' : 'bg-muted justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">营销 Cookie</p>
                    <p className="text-xs text-muted-foreground">
                      用于个性化广告和内容
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                    className={`w-10 h-5 rounded-full flex items-center px-1 transition-colors ${
                      preferences.marketing ? 'bg-primary justify-end' : 'bg-muted justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="flex-1"
                >
                  拒绝全部
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptSelected}
                  className="flex-1"
                >
                  保存设置
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
