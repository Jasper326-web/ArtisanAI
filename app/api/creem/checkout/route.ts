import { NextRequest, NextResponse } from 'next/server';

const CREEM_API_KEY = process.env.CREEM_API_KEY || 'creem_test_7Pio5ccVdDKTaSz6ijf5Te';
const CREEM_API_URL = 'https://test-api.creem.io/v1/checkouts';

interface CheckoutRequest {
  plan_id: string;
  price: string;
  credits: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();
    const { plan_id, price, credits } = body;

    // 支持所有积分包
    const validPlans = ['small', 'medium', 'large', 'xlarge', 'mega'];
    if (!validPlans.includes(plan_id)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // 创建 Creem 结账会话
    const response = await fetch(CREEM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CREEM_API_KEY,
      },
      body: JSON.stringify({
        product_id: 'prod_j8RS5IyEKO0MiYG2Bdusi', // 你的 Creem 产品 ID
        metadata: {
          plan_id,
          credits,
          user_agent: req.headers.get('user-agent') || '',
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
        },
        success_url: `http://localhost:3000/pricing?success=true&plan=${plan_id}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Creem API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      checkout_url: data.checkout_url,
      session_id: data.id,
    });

  } catch (error: any) {
    console.error('Checkout creation error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Unknown error' },
      { status: 500 }
    );
  }
}
