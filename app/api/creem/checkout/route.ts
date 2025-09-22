import { NextRequest, NextResponse } from 'next/server';

// 通过显式环境变量切换 test/live，避免通过 key 前缀误判
const CREEM_ENV = process.env.CREEM_ENV || 'test';
const CREEM_API_KEY = process.env.CREEM_API_KEY || 'creem_test_7Pio5ccVdDKTaSz6ijf5Te';
const CREEM_API_URL = CREEM_ENV === 'live'
  ? 'https://api.creem.io/v1/checkouts'
  : 'https://test-api.creem.io/v1/checkouts';

// 环境配置验证
const isTestMode = CREEM_ENV !== 'live';
const isLiveMode = CREEM_ENV === 'live';

console.log('=== Creem Environment Configuration ===');
console.log('CREEM_ENV:', CREEM_ENV);
console.log('API URL:', CREEM_API_URL);
console.log('Environment mode:', isTestMode ? 'TEST' : isLiveMode ? 'LIVE' : 'UNKNOWN');
console.log('Success URL will be:', process.env.CREEM_SUCCESS_URL || `https://artisans-ai.com/success`);

interface CheckoutRequest {
  plan_id: string;
  price: string;
  credits: number;
  user_id: string; // 添加用户ID
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();
    const { plan_id, price, credits, user_id } = body;
    
    console.log('Creem checkout request:', { plan_id, user_id, environment: CREEM_API_URL.includes('test-api') ? 'TEST' : 'LIVE' });

    // 支持所有积分包
    const validPlans = ['small', 'medium', 'large', 'xlarge', 'mega'];
    if (!validPlans.includes(plan_id)) {
      console.error('Invalid plan ID:', plan_id);
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // 产品ID映射 - 从环境变量读取（可配置为 live/test），并提供测试默认值兜底
    const productIdMap: Record<string, string> = {
      small: process.env.CREEM_PRODUCT_SMALL || 'prod_hjE2miByilwiAMNFFfRm7',
      medium: process.env.CREEM_PRODUCT_MEDIUM || 'prod_hjE2miByilwiAMNFFfRm7',
      large: process.env.CREEM_PRODUCT_LARGE || 'prod_hjE2miByilwiAMNFFfRm7',
      xlarge: process.env.CREEM_PRODUCT_XLARGE || 'prod_hjE2miByilwiAMNFFfRm7',
      mega: process.env.CREEM_PRODUCT_MEGA || 'prod_hjE2miByilwiAMNFFfRm7',
    };

    // 强制设置success_url，确保跳转到正确的页面
    const successUrl = process.env.CREEM_SUCCESS_URL || `https://artisans-ai.com/success`;
    
    // 创建 Creem 结账会话 - 使用官方示例格式
    const requestBody = {
      product_id: productIdMap[plan_id],
      success_url: successUrl, // 强制设置，覆盖product默认设置
      request_id: user_id, // 直接使用用户ID作为request_id，这是关键
      metadata: {
        plan_id,
        credits,
        user_agent: req.headers.get('user-agent') || '',
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
      }
    };
    
    console.log('Creem API request:', {
      url: CREEM_API_URL,
      product_id: productIdMap[plan_id],
      success_url: requestBody.success_url,
      api_key: CREEM_API_KEY.substring(0, 20) + '...' // 只显示前20个字符
    });
    
    const response = await fetch(CREEM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Creem API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Creem API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(
        { error: `Creem API error: ${response.status} - ${errorData}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // 详细记录Creem返回的数据
    console.log('Creem API response data:', {
      checkout_url: data.checkout_url,
      success_url: data.success_url || 'Not provided by Creem',
      session_id: data.id,
      status: data.status,
      full_response_keys: Object.keys(data)
    });
    
    return NextResponse.json({
      checkout_url: data.checkout_url,
      session_id: data.id,
      success_url: data.success_url, // 也返回success_url用于调试
    });

  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
