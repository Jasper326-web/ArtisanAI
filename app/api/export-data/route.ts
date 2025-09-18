import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 收集用户数据
    const userData = {
      profile: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      credits: null,
      orders: [],
      feedback: [],
      generated_images: [],
    };

    // 获取积分信息
    const { data: credits } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (credits) {
      userData.credits = credits;
    }

    // 获取订单信息
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (orders) {
      userData.orders = orders;
    }

    // 获取反馈信息
    const { data: feedback } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (feedback) {
      userData.feedback = feedback;
    }

    // 获取生成的图像信息（如果有存储的话）
    // 注意：这里假设你有一个存储生成图像的表格
    // 如果没有，可以跳过这部分
    try {
      const { data: images } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (images) {
        userData.generated_images = images;
      }
    } catch (error) {
      // 如果表格不存在，忽略错误
      console.log('Generated images table not found, skipping...');
    }

    // 生成导出文件名
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `artisan-ai-data-export-${timestamp}.json`;

    // 返回JSON数据
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
