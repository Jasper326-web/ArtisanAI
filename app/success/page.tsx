'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/logo';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const supabase = createClient();

  // 获取用户信息
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ 
            id: session.user.id, 
            email: session.user.email 
          });
          // 立即刷新积分
          await refreshCredits(session.user.id);
        }
      } catch (error) {
        console.error('获取用户会话失败:', error);
      }
    };

    getSession();
  }, [supabase]);

  // 刷新用户积分
  const refreshCredits = async (userId: string) => {
    setIsRefreshing(true);
    try {
      const response = await fetch(`/api/credits?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const newCredits = data.balance || 0;
        setUserCredits(newCredits);
        
        // 触发全局积分更新事件
        window.dispatchEvent(new CustomEvent('credits:update', {
          detail: { 
            balance: newCredits,
            remaining: newCredits 
          }
        }));

        console.log('✅ 积分刷新成功:', newCredits);
        
        toast({
          title: "支付成功！",
          description: `您的积分已更新到 ${newCredits.toLocaleString()} 积分`,
          variant: "default",
        });
      } else {
        console.error('积分刷新失败:', response.status);
      }
    } catch (error) {
      console.error('积分刷新错误:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 手动刷新积分
  const handleRefreshCredits = async () => {
    if (user?.id) {
      await refreshCredits(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
        {/* Logo */}
        <div className="mb-6">
          <Logo size={60} className="justify-center" />
        </div>

        {/* Success Icon */}
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            支付成功！
          </h1>
          <p className="text-gray-300">
            感谢您的购买，积分已添加到您的账户
          </p>
        </div>

        {/* Credits Display */}
        <div className="mb-6 p-4 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center justify-center mb-2">
            <CreditCard className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-gray-300">当前积分</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {userCredits !== null ? (
              userCredits.toLocaleString()
            ) : (
              <div className="animate-pulse">加载中...</div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleRefreshCredits}
            disabled={isRefreshing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRefreshing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                刷新积分中...
              </div>
            ) : (
              '刷新积分'
            )}
          </Button>
          
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-black/20 rounded text-xs text-gray-400">
            <p>调试信息:</p>
            <p>用户ID: {user?.id || '未登录'}</p>
            <p>URL参数: {searchParams.toString() || '无'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
