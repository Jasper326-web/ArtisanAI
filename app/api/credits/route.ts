import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Minimal credits API:
// - GET: query current credits for a user
// - POST: recharge credits (amount>0)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If user has no credits row yet, provision initial 120 credits on first GET
    if (!data) {
      console.log('No credits record found for user:', userId, 'Provisioning initial 120 credits');
      
      // Try direct insert first to avoid raising on missing RPCs
      const { data: insertRes, error: insertErr } = await supabase
        .from('credits')
        .insert({ user_id: userId, balance: 120 })
        .select('balance')
        .maybeSingle();

      if (insertErr) {
        console.error('Direct insert failed:', insertErr);
        // Fallback to recharge_credits RPC if direct insert failed due to constraints
        const { data: rechargeRes, error: rechargeErr } = await supabase.rpc('recharge_credits', {
          p_user_id: userId,
          p_amount: 120,
        });
        if (rechargeErr) {
          console.error('RPC recharge failed:', rechargeErr);
          return NextResponse.json({ error: rechargeErr.message }, { status: 500 });
        }
        return NextResponse.json({ balance: rechargeRes?.balance ?? 120 });
      }

      return NextResponse.json({ balance: insertRes?.balance ?? 120 });
    }

    const balance = data?.balance ?? 0;
    return NextResponse.json({ balance });
  } catch (e: any) {
    console.error('Unexpected error in credits API:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, amount } = body || {};

    if (!user_id || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // upsert credits
    const { data, error } = await supabase.rpc('recharge_credits', {
      p_user_id: user_id,
      p_amount: amount,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ balance: data?.balance ?? null }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}


