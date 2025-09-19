'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import LightRays from '@/components/light-rays';
import { createClient } from '@/lib/supabase-client';

interface PricingPlan {
  id: string;
  name: string;
  nameKey: string;
  price: string;
  credits: number;
  images: number;
  descriptionKey: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: string[];
  available: boolean;
}

export default function PricingPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const supabase = createClient();

  // 获取当前用户信息
  useEffect(() => {
    const getSession = async () => {
      console.log('🔍 开始获取用户会话...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📋 会话获取结果:', { session, error });
        
        if (session?.user) {
          console.log('✅ 用户已登录:', session.user.id, session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          console.log('❌ 用户未登录');
          setUser(null);
        }
      } catch (error) {
        console.error('💥 获取会话时出错:', error);
        setUser(null);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 认证状态变化:', event, session?.user?.id);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const creditPacks: PricingPlan[] = [
    {
      id: 'small',
      name: '小包',
      nameKey: 'pricing.small.name',
      price: '$4.99',
      credits: 300,
      images: 6,
      descriptionKey: 'pricing.small.description',
      icon: <Zap className="h-6 w-6" />,
      features: ['pricing.small.feature1', 'pricing.small.feature2', 'pricing.small.feature3'],
      available: true
    },
    {
      id: 'medium',
      name: '中包',
      nameKey: 'pricing.medium.name',
      price: '$9.99',
      credits: 700,
      images: 14,
      descriptionKey: 'pricing.medium.description',
      icon: <Star className="h-6 w-6" />,
      popular: true,
      features: ['pricing.medium.feature1', 'pricing.medium.feature2', 'pricing.medium.feature3'],
      available: true
    },
    {
      id: 'large',
      name: '大包',
      nameKey: 'pricing.large.name',
      price: '$19.99',
      credits: 1600,
      images: 32,
      descriptionKey: 'pricing.large.description',
      icon: <Crown className="h-6 w-6" />,
      features: ['pricing.large.feature1', 'pricing.large.feature2', 'pricing.large.feature3'],
      available: true
    },
    {
      id: 'xlarge',
      name: '超大包',
      nameKey: 'pricing.xlarge.name',
      price: '$49.99',
      credits: 4500,
      images: 90,
      descriptionKey: 'pricing.xlarge.description',
      icon: <Building2 className="h-6 w-6" />,
      features: ['pricing.xlarge.feature1', 'pricing.xlarge.feature2', 'pricing.xlarge.feature3'],
      available: true
    },
    {
      id: 'mega',
      name: '超级包',
      nameKey: 'pricing.mega.name',
      price: '$99.99',
      credits: 10000,
      images: 200,
      descriptionKey: 'pricing.mega.description',
      icon: <Building2 className="h-6 w-6" />,
      features: ['pricing.mega.feature1', 'pricing.mega.feature2', 'pricing.mega.feature3'],
      available: true
    }
  ];

  // 计算额外积分奖励
  const getBonusCredits = (credits: number) => {
    if (credits >= 10000) return 2000; // 超级包额外2000积分
    if (credits >= 4500) return 1000;  // 超大包额外1000积分
    if (credits >= 1600) return 400;   // 大包额外400积分
    if (credits >= 700) return 200;    // 中包额外200积分
    return 0; // 小包无额外积分
  };

  const handlePurchase = async (plan: PricingPlan) => {
    console.log('🛒 开始购买流程:', { plan: plan.id, user: user?.id });
    
    if (!plan.available) {
      toast({
        title: t?.pricing?.coming_soon || 'Coming Soon',
        description: t?.pricing?.coming_soon_description || 'This plan will be available after testing is complete.',
        variant: 'default'
      });
      return;
    }

    // 检查用户是否已登录
    if (!user?.id) {
      console.log('❌ 用户未登录，无法购买');
      toast({
        title: '请先登录',
        description: '购买积分前请先登录您的账户。',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ 用户已登录，继续购买流程');

    setLoading(plan.id);
    
    try {
      // 调用 Creem API 创建结账会话
      const response = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: plan.id,
          price: plan.price,
          credits: plan.credits + getBonusCredits(plan.credits),
          user_id: user.id // 传递用户ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkout_url } = await response.json();
      
      // 重定向到 Creem 结账页面
      window.location.href = checkout_url;
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: t?.pricing?.purchase_error || 'Purchase Error',
        description: t?.pricing?.purchase_error_description || 'Failed to create checkout session. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Prism Background */}
      <div className="fixed inset-0 z-0">
        <LightRays />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-6 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t?.pricing?.title || '积分购买'}
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            {t?.pricing?.subtitle || '选择适合你的积分包，买得越多送得越多！'}
          </p>
        </div>

        {/* Credit Packs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {creditPacks.map((pack) => {
            const bonusCredits = getBonusCredits(pack.credits);
            const totalCredits = pack.credits + bonusCredits;
            
            return (
              <Card 
                key={pack.id}
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer ${
                  pack.popular 
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/25 bg-gradient-to-br from-purple-900/20 to-pink-900/20' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                }`}
                onClick={() => handlePurchase(pack)}
              >
                {pack.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                    {t?.pricing?.most_popular || '最受欢迎'}
                  </div>
                )}
                
                <CardContent className={`p-6 text-center ${pack.popular ? 'pt-12' : 'pt-6'}`}>
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      pack.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {pack.icon}
                    </div>
                  </div>
                  
                  {/* Pack Name */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {pack.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="text-3xl font-bold text-white mb-4">
                    {pack.price}
                  </div>
                  
                  {/* Credits Display */}
                  <div className="space-y-2 mb-6">
                    <div className="text-2xl font-bold text-blue-400">
                      {pack.credits.toLocaleString()} 积分
                    </div>
                    {bonusCredits > 0 && (
                      <div className="text-sm text-green-400 font-medium">
                        + {bonusCredits.toLocaleString()} 额外积分
                      </div>
                    )}
                    <div className="text-sm text-gray-400">
                      总计: {totalCredits.toLocaleString()} 积分
                    </div>
                    <div className="text-xs text-gray-500">
                      ≈ {Math.floor(totalCredits / 50)} 张图片
                    </div>
                  </div>
                  
                  {/* Purchase Button */}
                  <Button
                    disabled={loading === pack.id}
                    className={`w-full ${
                      pack.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    } text-white`}
                  >
                    {loading === pack.id ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t?.pricing?.processing || '处理中...'}
                      </div>
                    ) : (
                      t?.pricing?.purchase_now || '立即购买'
                    )}
                  </Button>
                  
                  {/* Value Indicator */}
                  {bonusCredits > 0 && (
                    <div className="mt-3 text-xs text-green-400 font-medium">
                      💰 超值优惠
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t?.pricing?.why_choose_us || 'Why Choose ArtisanAI?'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
              <div>
                <h4 className="font-semibold text-white mb-2">{t?.pricing?.feature1_title || 'High Quality'}</h4>
                <p className="text-sm">{t?.pricing?.feature1_description || 'Professional-grade AI models for stunning results'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">{t?.pricing?.feature2_title || 'Fast Processing'}</h4>
                <p className="text-sm">{t?.pricing?.feature2_description || 'Generate images in seconds, not minutes'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">{t?.pricing?.feature3_title || 'Consistent Results'}</h4>
                <p className="text-sm">{t?.pricing?.feature3_description || 'Maintain character consistency across all generations'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
