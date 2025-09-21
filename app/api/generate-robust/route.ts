import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-client';
import { initAPIKeys } from '@/lib/init-api-keys';
import { aiClient } from '@/lib/ai-client';
import * as crypto from 'crypto';

// 初始化 API Key 管理器
initAPIKeys();

const COST_PER_GENERATION = 50;
const MAX_RETRIES = 2;

// 生成唯一交易ID
function generateTransactionId(userId: string, prompt: string): string {
  const timestamp = Date.now();
  const promptHash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
  return `gen_${userId.substring(0, 8)}_${timestamp}_${promptHash}`;
}

// 生成提示词哈希
function generatePromptHash(prompt: string): string {
  return crypto.createHash('md5').update(prompt).digest('hex');
}

interface GenerateRequest {
  user_id: string;
  prompt: string;
  images?: string[];
  model?: string;
  transaction_id?: string; // 可选，用于重试
}

export async function POST(req: NextRequest) {
  let transactionId: string | null = null;
  let userId: string | null = null;

  try {
    console.log('🚀 Robust Generate API called');
    const body: GenerateRequest = await req.json();
    const { user_id, prompt, images, model, transaction_id } = body;
    
    userId = user_id;
    
    console.log('📋 Request details:', {
      user_id: user_id ? 'present' : 'missing',
      prompt: prompt ? `"${prompt.substring(0, 50)}..."` : 'missing',
      images: images ? `${images.length} images` : 'none',
      model: model || 'undefined',
      transaction_id: transaction_id || 'new'
    });

    // 验证必需参数
    if (!user_id || !prompt) {
      return NextResponse.json({ 
        error: 'Missing user_id or prompt',
        code: 'MISSING_PARAMETERS'
      }, { status: 400 });
    }

    // 生成或使用现有交易ID
    transactionId = transaction_id || generateTransactionId(user_id, prompt);
    const promptHash = generatePromptHash(prompt);

    console.log(`🆔 Transaction ID: ${transactionId}`);

    // 如果是重试请求，检查现有交易
    if (transaction_id) {
      console.log('🔄 Handling retry request');
      
      const { data: existingTransaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('transaction_id', transaction_id)
        .single();

      if (txError || !existingTransaction) {
        return NextResponse.json({ 
          error: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND'
        }, { status: 404 });
      }

      // 检查重试次数
      if (existingTransaction.retry_count >= existingTransaction.max_retries) {
        return NextResponse.json({ 
          error: 'Max retries exceeded',
          code: 'MAX_RETRIES_EXCEEDED',
          transaction: existingTransaction
        }, { status: 429 });
      }

      // 更新重试次数
      const { data: retryResult, error: retryError } = await supabase.rpc('retry_transaction', {
        p_transaction_id: transaction_id,
        p_increment_retry: true
      });

      if (retryError || !retryResult?.[0]?.can_retry) {
        return NextResponse.json({ 
          error: 'Cannot retry transaction',
          code: 'RETRY_FAILED'
        }, { status: 500 });
      }

      console.log(`🔄 Retry ${retryResult[0].retry_count} for transaction ${transaction_id}`);
    } else {
      // 新交易：原子性扣减积分
      console.log('💰 Deducting credits with transaction tracking');
      
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_credits_with_transaction', {
        p_user_id: user_id,
        p_amount: COST_PER_GENERATION,
        p_transaction_id: transactionId,
        p_operation_type: 'generation',
        p_api_provider: 'gemini',
        p_model_used: 'gemini-2.5-flash-image-preview',
        p_prompt_hash: promptHash,
        p_metadata: {
          prompt_length: prompt.length,
          has_images: !!(images && images.length > 0),
          image_count: images?.length || 0,
          user_agent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
        }
      });

      if (deductError) {
        console.error('❌ Credit deduction failed:', deductError);
        
        if (deductError.message.includes('DUPLICATE_TRANSACTION_ID')) {
          return NextResponse.json({ 
            error: 'Duplicate transaction detected',
            code: 'DUPLICATE_TRANSACTION'
          }, { status: 409 });
        }
        
        if (deductError.message.includes('INSUFFICIENT_CREDITS')) {
          return NextResponse.json({ 
            error: 'Insufficient credits',
            code: 'INSUFFICIENT_CREDITS'
          }, { status: 402 });
        }

        return NextResponse.json({ 
          error: `Credit deduction failed: ${deductError.message}`,
          code: 'DEDUCTION_FAILED'
        }, { status: 500 });
      }

      console.log('✅ Credits deducted successfully:', {
        new_balance: deductResult?.[0]?.new_balance,
        transaction: deductResult?.[0]?.transaction_record
      });
    }

    // 调用AI服务生成图像
    console.log('🎨 Starting image generation...');
    
    let imageResult;
    let apiProvider = 'gemini';
    
    try {
      // 根据是否有图像选择不同的处理方式
      if (images && images.length > 0) {
        console.log(`🖼️ Using image editing with ${images.length} images`);
        
        if (images.length === 1) {
          const firstImage = images[0];
          const base64Data = firstImage.split(',')[1];
          const mimeType = firstImage.split(',')[0].split(':')[1].split(';')[0];
          
          // 使用现有的AI客户端进行图像编辑
          imageResult = await aiClient.editImage(prompt, base64Data, mimeType);
        } else {
          // 多张图片融合编辑
          console.log(`🔄 Processing multiple image fusion: ${images.length} images`);
          imageResult = await aiClient.editMultipleImages(prompt, images);
        }
      } else {
        console.log("🎨 Using text-to-image generation");
        
        // 使用现有的AI客户端
        imageResult = await aiClient.generateImage(prompt);
        apiProvider = aiClient.getCurrentProvider();
      }

    } catch (apiError: any) {
      console.error('❌ AI API Error:', apiError);
      
      // 标记交易为失败并退款
      await supabase.rpc('refund_transaction', {
        p_transaction_id: transactionId,
        p_reason: `API Error: ${apiError.message}`
      });

      return NextResponse.json({ 
        error: `Image generation failed: ${apiError.message}`,
        code: 'GENERATION_FAILED',
        transaction_id: transactionId,
        can_retry: true
      }, { status: 500 });
    }

    // 处理生成结果
    if (!imageResult.success) {
      console.error('❌ Generation failed:', imageResult.error);
      
      // 标记交易为失败并退款
      const { data: refundResult } = await supabase.rpc('refund_transaction', {
        p_transaction_id: transactionId,
        p_reason: `Generation failed: ${imageResult.error}`
      });

      return NextResponse.json({ 
        error: `Image generation failed: ${imageResult.error}`,
        code: 'GENERATION_FAILED',
        transaction_id: transactionId,
        refunded: refundResult?.[0]?.success,
        new_balance: refundResult?.[0]?.new_balance,
        can_retry: true
      }, { status: 500 });
    }

    // 生成成功，标记交易完成
    console.log('✅ Image generation successful');
    
    const { data: completeResult } = await supabase.rpc('complete_transaction', {
      p_transaction_id: transactionId,
      p_status: 'completed',
      p_metadata: {
        api_provider: apiProvider,
        model_used: 'gemini-2.5-flash-image-preview',
        image_generated: true,
        completed_at: new Date().toISOString()
      }
    });

    // 获取最新余额
    const { data: balanceData } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user_id)
      .single();

    return NextResponse.json({ 
      success: true,
      image: imageResult.imageUrl,
      remaining: balanceData?.balance ?? null,
      model: 'gemini-2.5-flash-image-preview',
      provider: apiProvider,
      transaction_id: transactionId,
      tokens_used: 50,
      transaction_completed: completeResult?.[0]?.success
    });

  } catch (error: any) {
    console.error('💥 Unexpected error in robust generation:', error);
    
    // 如果有交易ID，尝试退款
    if (transactionId && userId) {
      try {
        await supabase.rpc('refund_transaction', {
          p_transaction_id: transactionId,
          p_reason: `Unexpected error: ${error.message}`
        });
      } catch (refundError) {
        console.error('❌ Failed to refund after error:', refundError);
      }
    }

    return NextResponse.json({ 
      error: error.message || 'Unknown error occurred',
      code: 'UNEXPECTED_ERROR',
      transaction_id: transactionId
    }, { status: 500 });
  }
}
