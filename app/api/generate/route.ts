import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aiClient } from '@/lib/ai-client';
import { initAPIKeys } from '@/lib/init-api-keys';

// 初始化 API Key 管理器
initAPIKeys();

// Google Gemini 2.5 Flash Image Preview integration.
// Consumes 50 credits per generation.

const COST_PER_GENERATION = 50;

export async function POST(req: NextRequest) {
  try {
    console.log('Generate API called');
    const body = await req.json();
    const { user_id, prompt, images, model } = body || {};
    
    console.log('Request body:', {
      user_id: user_id ? 'present' : 'missing',
      prompt: prompt ? `"${prompt.substring(0, 50)}..."` : 'missing',
      images: images ? `${images.length} images` : 'none',
      model: model || 'undefined'
    });

    if (!user_id || !prompt) {
      return NextResponse.json({ error: 'Missing user_id or prompt' }, { status: 400 });
    }

    // Check credits
    const { data: creditRow, error: qErr } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', user_id)
      .maybeSingle();

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    const current = creditRow?.balance ?? 0;
    if (current < COST_PER_GENERATION) {
      return NextResponse.json({ error: 'INSUFFICIENT_CREDITS' }, { status: 402 });
    }

    // Deduct credits via RPC to avoid race conditions
    const { data: decRes, error: decErr } = await supabase.rpc('deduct_credits', {
      p_user_id: user_id,
      p_amount: COST_PER_GENERATION,
    });
    if (decErr) {
      return NextResponse.json({ error: decErr.message }, { status: 500 });
    }

    // Call AI service (Vertex AI in production, AI Studio in development)
    try {
      let imageResult;
      
      // 如果有上传的图像，使用图像编辑功能；否则使用纯文本生成
      if (images && images.length > 0) {
        console.log(`🎨 使用图像编辑功能，上传了 ${images.length} 张图像`);
        
        if (images.length === 1) {
          // 单张图片编辑
          const firstImage = images[0];
          const base64Data = firstImage.split(',')[1];
          const mimeType = firstImage.split(',')[0].split(':')[1].split(';')[0];
          
          imageResult = await aiClient.editImage(prompt, base64Data, mimeType);
        } else {
          // 多张图片融合编辑
          console.log(`🔄 处理多张图片融合，共 ${images.length} 张`);
          imageResult = await aiClient.editMultipleImages(prompt, images);
        }
      } else {
        console.log("🎨 使用纯文本图像生成功能");
        imageResult = await aiClient.generateImage(prompt);
      }

      if (!imageResult.success) {
        // If Gemini fails, refund the credits
        await supabase.rpc('recharge_credits', {
          p_user_id: user_id,
          p_amount: COST_PER_GENERATION,
        });

        return NextResponse.json({ 
          error: `Image generation failed: ${imageResult.error}` 
        }, { status: 500 });
      }

      // 确保返回有效的余额数值
      const remainingBalance = decRes?.balance ?? (current - COST_PER_GENERATION);
      
      return NextResponse.json({ 
        image: imageResult.imageUrl, 
        remaining: remainingBalance,
        model: 'gemini-2.5-flash-image-preview',
        provider: aiClient.getCurrentProvider(),
        tokens_used: 50 // Estimated token usage for image generation
      });
    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError);
      
      // If Gemini fails, refund the credits
      try {
        await supabase.rpc('recharge_credits', {
          p_user_id: user_id,
          p_amount: COST_PER_GENERATION,
        });
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError);
      }

      return NextResponse.json({ 
        error: `Image generation failed: ${geminiError?.message || 'Unknown Gemini error'}`,
        details: geminiError?.toString() || 'No additional details'
      }, { status: 500 });
    }
  } catch (e: any) {
    console.error('General API Error:', e);
    return NextResponse.json({ 
      error: e?.message ?? 'Unknown error',
      details: e?.toString() || 'No additional details'
    }, { status: 500 });
  }
}


