'use client';

import React, { useState, useEffect } from 'react';
import { AuthModal } from './auth-modal';
import { createClient } from '@/lib/supabase-client';

/**
 * 认证系统使用示例
 * 
 * 这个组件展示了如何集成 AuthModal 到现有项目中
 * 包含用户状态管理、登录/登出处理等
 */
export function AuthExample() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // 检查用户登录状态
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 处理登录成功
  const handleAuthSuccess = () => {
    console.log('Authentication successful!');
    setShowAuth(false);
    // 这里可以添加其他成功后的逻辑，比如重定向、更新状态等
  };

  // 处理登出
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        setUser(null);
        console.log('Signed out successfully');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">加载中...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        // 已登录状态
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">欢迎，</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            退出登录
          </button>
        </div>
      ) : (
        // 未登录状态
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            登录
          </button>
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 text-sm border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            注册
          </button>
        </div>
      )}

      {/* 认证模态 */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

/**
 * 在现有导航组件中集成认证的示例
 * 
 * 在 navigation.tsx 中：
 * 
 * import { AuthExample } from '@/components/auth-example';
 * 
 * export function Navigation() {
 *   return (
 *     <nav className="flex items-center justify-between p-4">
 *       <div>Logo</div>
 *       <AuthExample />
 *     </nav>
 *   );
 * }
 */

/**
 * 在页面中直接使用的示例
 * 
 * 在 page.tsx 中：
 * 
 * import { AuthModal } from '@/components/auth-modal';
 * 
 * export default function HomePage() {
 *   const [showAuth, setShowAuth] = useState(false);
 * 
 *   return (
 *     <div>
 *       <h1>欢迎使用我们的应用</h1>
 *       <button onClick={() => setShowAuth(true)}>
 *         开始使用
 *       </button>
 *       
 *       <AuthModal
 *         isOpen={showAuth}
 *         onClose={() => setShowAuth(false)}
 *         onSuccess={() => {
 *           console.log('用户已登录');
 *           setShowAuth(false);
 *         }}
 *       />
 *     </div>
 *   );
 * }
 */
