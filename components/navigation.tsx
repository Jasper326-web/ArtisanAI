'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, Settings, CreditCard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AuthDialog } from '@/components/auth-dialog';
import Logo from '@/components/logo';
import { useLanguage } from '@/contexts/language-context';
import { supabase } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { trackAuth } from '@/lib/umami';

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

export function Navigation() {
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingCredits, setIsFetchingCredits] = useState(false);
  const lastCreditsFetchAtRef = useRef<string | null>(null);

  const pickDefaultAvatar = () => '/face_17.png';

  // (moved below) Check auth state

  const fetchUserCredits = useCallback(async (userId: string) => {
    // 防止重复请求
    if (isFetchingCredits) {
      return;
    }
    
    setIsFetchingCredits(true);
    try {
      const response = await fetch(`/api/credits?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.balance || 0);
      } else {
        // 如果请求失败，设置积分为0，避免无限重试
        console.error('Failed to fetch credits:', response.status, response.statusText);
        setUserCredits(0);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      setUserCredits(0);
    } finally {
      setIsFetchingCredits(false);
    }
  }, [isFetchingCredits]);

  // Check auth state (placed after fetchUserCredits to avoid TDZ)
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        });
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
          });
        } else {
          setUser(null);
          setUserCredits(0);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserCredits]);

  // Fetch credits only when user.id changes, once per user
  useEffect(() => {
    if (!user?.id) return;
    if (lastCreditsFetchAtRef.current === user.id) return;
    lastCreditsFetchAtRef.current = user.id;
    fetchUserCredits(user.id);
  }, [user?.id, fetchUserCredits]);

  // Listen to global credits updates (e.g., generate/recharge responses)
  useEffect(() => {
    const onCreditsUpdate = (e: any) => {
      const next = Number(e?.detail?.balance ?? e?.detail?.remaining);
      if (!Number.isNaN(next)) setUserCredits(next);
    };
    window.addEventListener('credits:update', onCreditsUpdate as any);
    return () => window.removeEventListener('credits:update', onCreditsUpdate as any);
  }, []);

  const handleSignOut = async () => {
    // 追踪登出
    trackAuth('logout', { 
      userId: user?.id, 
      userEmail: user?.email 
    });

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // 网络失败或 token 撤销失败时，降级为本地清理，避免卡死
        await supabase.auth.signOut({ scope: 'local' } as any);
      }
    } catch (_) {
      // 强制本地登出，保证按钮可用
      await supabase.auth.signOut({ scope: 'local' } as any);
    } finally {
      setUser(null);
      setUserCredits(0);
    }
  };

  const navItems = [
    { href: '/', label: t?.nav?.home || 'Home' },
    { href: '/pricing', label: t?.nav?.pricing || 'Pricing' },
    { href: '/contact', label: t?.nav?.contact || 'Contact' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header 
        className="sticky top-0 z-50 w-full bg-transparent border-none shadow-none outline-none" 
        style={{ 
          border: 'none !important', 
          boxShadow: 'none !important',
          outline: 'none !important',
          backgroundColor: 'transparent !important'
        }}
      >
        <div className="container mx-auto px-4 relative">
          <div className="flex h-16 items-center">
            {/* Logo - Left side */}
            <Link href="/" className="flex items-center">
              <Logo size={32} showText={true} />
            </Link>

            {/* Desktop Navigation - Fixed center position */}
            <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-white",
                    isActive(item.href) ? "text-white" : "text-gray-300"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions - Fixed right position */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-white hover:text-white bg-transparent hover:bg-transparent border-none shadow-none">
                    {language.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'zh', name: '中文' },
                  ].map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                      className={cn(
                        language === lang.code && "bg-accent"
                      )}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>


              {/* User Menu */}
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-8 w-8 rounded-full bg-transparent hover:bg-transparent border-none shadow-none">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden bg-white ring-1 ring-white/20">
                          <Image
                            src={user.avatar_url || pickDefaultAvatar()}
                            alt={user.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                            priority
                            onError={(e: any) => {
                              const img = e?.currentTarget as HTMLImageElement | undefined;
                              const fallback = '/face_17.png';
                              if (img && img.getAttribute('src') !== fallback) {
                                img.setAttribute('src', fallback);
                              }
                            }}
                          />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <CreditCard className="h-3 w-3" />
                          <span className="text-xs">{userCredits} credits</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Buy Credits</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                </div>
              ) : (
                <Button 
                  onClick={() => setIsAuthOpen(true)} 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {t?.auth?.signIn?.button || 'Sign In'}
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden text-white hover:text-white bg-transparent hover:bg-transparent border-none shadow-none">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-lg font-medium transition-colors",
                          isActive(item.href) ? "text-purple-500" : "text-gray-600"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {!user && (
                      <Button 
                        onClick={() => {
                          setIsAuthOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        {t?.auth?.signIn?.button || 'Sign In'}
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          // Refresh credits after successful auth
          if (user) {
            fetchUserCredits(user.id);
          }
        }}
      />
    </>
  );
}
