import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      return NextResponse.json({ 
        error: 'Missing transaction_id parameter' 
      }, { status: 400 });
    }

    console.log(`🔍 Checking transaction status: ${transactionId}`);

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      console.error('Transaction lookup error:', error);
      return NextResponse.json({ 
        error: 'Transaction not found' 
      }, { status: 404 });
    }

    console.log(`✅ Transaction found:`, {
      id: transaction.transaction_id,
      status: transaction.status,
      retry_count: transaction.retry_count,
      max_retries: transaction.max_retries
    });

    return NextResponse.json({
      transaction_id: transaction.transaction_id,
      status: transaction.status,
      amount: transaction.amount,
      operation_type: transaction.operation_type,
      api_provider: transaction.api_provider,
      model_used: transaction.model_used,
      retry_count: transaction.retry_count,
      max_retries: transaction.max_retries,
      error_message: transaction.error_message,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
      metadata: transaction.metadata
    });

  } catch (error: any) {
    console.error('Transaction status check error:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error occurred' 
    }, { status: 500 });
  }
}
