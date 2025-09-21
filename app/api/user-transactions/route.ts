import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing user_id parameter' 
      }, { status: 400 });
    }

    console.log(`📊 Getting transactions for user: ${userId} (limit: ${limit}, offset: ${offset})`);

    const { data: transactions, error } = await supabase.rpc('get_user_transactions', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      console.error('User transactions lookup error:', error);
      return NextResponse.json({ 
        error: 'Failed to retrieve transactions' 
      }, { status: 500 });
    }

    console.log(`✅ Retrieved ${transactions?.length || 0} transactions`);

    return NextResponse.json(transactions || []);

  } catch (error: any) {
    console.error('User transactions error:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error occurred' 
    }, { status: 500 });
  }
}
