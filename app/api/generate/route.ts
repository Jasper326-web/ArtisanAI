import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { aiClient } from '@/lib/ai-client';
import { initAPIKeys } from '@/lib/init-api-keys';
import { generateImageWithImagen } from '@/lib/imagen-service';

// 初始化 API Key 管理器
initAPIKeys();

// Google Gemini 2.5 Flash Image Preview integration.
// Consumes different credits based on mode:
// - Generate mode (Imagen-4.0): 50 credits for 3 images
// - Edit mode (Nano Banana): 30 credits for 1 image

const COST_GENERATE = 50; // Imagen-4.0 生图模式
const COST_EDIT = 30;     // Nano Banana 编辑模式

export async function POST(req: NextRequest) {
  try {
    console.log('Generate API called');
    const body = await req.json();
    const { user_id, prompt, images, model, aspect_ratio } = body || {};
    
    console.log('Request body:', {
      user_id: user_id ? 'present' : 'missing',
      prompt: prompt ? `"${prompt.substring(0, 50)}..."` : 'missing',
      images: images ? `${images.length} images` : 'none',
      model: model || 'undefined',
      aspect_ratio: aspect_ratio || '16:9 (default)'
    });
    
    console.log(`🔍 模型判断: model=${model}, model === 'imagen-4.0': ${model === 'imagen-4.0'}`);
    
    // 确定使用的模型和服务
    const isImagenMode = model === 'imagen-4.0';
    const actualModel = isImagenMode ? 'imagen-4.0-generate-001' : 'gemini-2.5-flash-image';
    const serviceProvider = isImagenMode ? 'Google AI Studio (Imagen-4.0)' : 'Google AI Studio (Nano Banana)';
    
    console.log(`🎯 确定使用模型: ${actualModel}`);
    console.log(`🏢 服务提供商: ${serviceProvider}`);
    console.log(`📊 模式类型: ${isImagenMode ? '生图模式 (Generate)' : '编辑模式 (Edit)'}`);

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

    // 根据模式确定积分消耗
    const costPerGeneration = model === 'imagen-4.0' ? COST_GENERATE : COST_EDIT;
    console.log(`💰 积分消耗: ${costPerGeneration} (模式: ${model || 'nano-banana'})`);

    const current = creditRow?.balance ?? 0;
    if (current < costPerGeneration) {
      return NextResponse.json({ error: 'INSUFFICIENT_CREDITS' }, { status: 402 });
    }

    // Deduct credits via RPC to avoid race conditions
    const { data: decRes, error: decErr } = await supabase.rpc('deduct_credits', {
      p_user_id: user_id,
      p_amount: costPerGeneration,
    });
    if (decErr) {
      return NextResponse.json({ error: decErr.message }, { status: 500 });
    }

    // Call AI service based on model type
    try {
      let imageResult;
      
      // 设置默认宽高比
      const finalAspectRatio = aspect_ratio || "16:9";
      console.log(`📐 使用宽高比: ${finalAspectRatio}`);
      console.log(`🤖 使用模型: ${model || 'nano-banana (默认)'}`);
      
      if (model === 'imagen-4.0') {
        // 使用 Imagen-4.0 生成图像
        console.log("🎨 开始调用 Imagen-4.0 生成图像");
        console.log(`📝 提示词: "${prompt.substring(0, 100)}..."`);
        console.log(`📐 宽高比: ${finalAspectRatio}`);
        
        if (images && images.length > 0) {
          console.log("❌ Imagen-4.0 不支持图像输入，拒绝请求");
          return NextResponse.json({ 
            error: 'Imagen-4.0 不支持图像输入，请使用编辑模式' 
          }, { status: 400 });
        }
        
        try {
          console.log("🚀 调用 generateImageWithImagen 函数...");
          const imageData = await generateImageWithImagen(prompt, finalAspectRatio);
          console.log(`✅ Imagen-4.0 生成成功，返回 ${imageData.all.length} 张图像`);
          imageResult = { 
            success: true, 
            image: imageData.primary,
            images: imageData.all // 返回所有图像供前端选择
          };
        } catch (error) {
          console.log(`❌ Imagen-4.0 生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
          imageResult = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Imagen-4.0 生成失败' 
          };
        }
      } else {
        // 使用 Nano Banana (现有逻辑)
        console.log("🎨 开始调用 Nano Banana (Gemini 2.5 Flash Image)");
        console.log(`📝 提示词: "${prompt.substring(0, 100)}..."`);
        console.log(`📐 宽高比: ${finalAspectRatio}`);
        
        // 如果有上传的图像，使用图像编辑功能；否则使用纯文本生成
        if (images && images.length > 0) {
          console.log(`🖼️ 使用 Nano Banana 图像编辑功能，上传了 ${images.length} 张图像`);
          
          if (images.length === 1) {
            // 单张图片编辑
            console.log("🔧 执行单张图片编辑...");
            const firstImage = images[0];
            const base64Data = firstImage.split(',')[1];
            const mimeType = firstImage.split(',')[0].split(':')[1].split(';')[0];
            
            imageResult = await aiClient.editImage(prompt, base64Data, mimeType, finalAspectRatio);
            console.log(`✅ Nano Banana 单张图片编辑完成: ${imageResult.success ? '成功' : '失败'}`);
          } else {
            // 多张图片融合编辑
            console.log(`🔄 执行多张图片融合编辑，共 ${images.length} 张`);
            imageResult = await aiClient.editMultipleImages(prompt, images, finalAspectRatio);
            console.log(`✅ Nano Banana 多张图片融合完成: ${imageResult.success ? '成功' : '失败'}`);
          }
        } else {
          console.log("🎨 使用 Nano Banana 纯文本图像生成功能");
          imageResult = await aiClient.generateImage(prompt, finalAspectRatio);
          console.log(`✅ Nano Banana 纯文本生成完成: ${imageResult.success ? '成功' : '失败'}`);
        }
      }

      if (!imageResult.success) {
        // If generation fails, refund the credits
        await supabase.rpc('recharge_credits', {
          p_user_id: user_id,
          p_amount: costPerGeneration,
        });

        return NextResponse.json({ 
          error: `Image generation failed: ${imageResult.error}` 
        }, { status: 500 });
      }

      // 确保返回有效的余额数值
      const remainingBalance = decRes?.balance ?? (current - costPerGeneration);
      
      return NextResponse.json({ 
        image: imageResult.image, 
        images: imageResult.images, // 多图数据 (仅生图模式)
        remaining: remainingBalance,
        model: model === 'imagen-4.0' ? 'imagen-4.0' : 'gemini-2.5-flash-image',
        provider: aiClient.getCurrentProvider(),
        tokens_used: model === 'imagen-4.0' ? 200 : 50 // 生图模式消耗更多 tokens
      });
    } catch (geminiError: any) {
      console.error('Gemini API Error:', geminiError);
      
      // If generation fails, refund the credits
      try {
        await supabase.rpc('recharge_credits', {
          p_user_id: user_id,
          p_amount: costPerGeneration,
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


