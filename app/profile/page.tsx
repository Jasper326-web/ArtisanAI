'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useLanguage } from '@/contexts/language-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, CreditCard, Settings } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const supabase = createClient();

  const pickDefaultAvatar = () => '/face_17.png';

  // 加载用户信息（只跑一次）
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
            created_at: session.user.created_at,
          });
        }
      } catch (err: any) {
        setFetchError(err?.message || 'Failed to load profile');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 仅在第一次拿到 user.id 时获取一次积分
  const hasFetchedCreditsRef = useRef<boolean>(false);
  useEffect(() => {
    if (!user?.id || hasFetchedCreditsRef.current) return;
    hasFetchedCreditsRef.current = true;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/credits?user_id=${user.id}`, { signal: controller.signal });
        if (!res.ok) {
          setFetchError(`HTTP ${res.status}`);
          return;
        }
        const json = await res.json();
        setUserCredits(Number(json.balance) || 0);
      } catch (e: any) {
        if (e?.name !== 'AbortError') setFetchError(e?.message || 'Credits fetch failed');
      }
    })();
    return () => controller.abort();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">{t?.loading || 'Loading...'}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">{t?.auth?.signInRequired || 'Please sign in'}</h1>
          <p>{t?.auth?.signInToViewProfile || 'You need to be signed in to view your profile.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">{t?.profile?.title || 'Profile'}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t?.profile?.userInfo || 'User Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img
                      src={user.avatar_url || pickDefaultAvatar()}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const fallback = '/face_17.png';
                        if (target.src.indexOf(fallback) === -1) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {user.name || t?.profile?.defaultName || 'User'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  {user.created_at && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">
                        {t?.profile?.joined || 'Joined'} {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credits Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t?.profile?.credits || 'Credits'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {fetchError ? '—' : userCredits}
                  </div>
                  <p className="text-gray-300 mb-2">{t?.profile?.availableCredits || 'Available Credits'}</p>
                  {fetchError && (
                    <p className="text-xs text-red-400 mb-2">{fetchError}</p>
                  )}
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      {t?.profile?.buyMoreCredits || 'Buy More Credits'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t?.profile?.quickActions || 'Quick Actions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    {t?.profile?.generateImages || 'Generate Images'}
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    {t?.profile?.buyCredits || 'Buy Credits'}
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    {t?.profile?.helpFaq || 'Help & FAQ'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
