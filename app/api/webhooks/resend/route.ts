import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('Resend webhook received:', payload);

    // 处理不同类型的 webhook 事件
    switch (payload.type) {
      case 'email.sent':
        console.log('Email sent successfully:', payload.data);
        break;
      case 'email.delivered':
        console.log('Email delivered:', payload.data);
        break;
      case 'email.bounced':
        console.log('Email bounced:', payload.data);
        break;
      case 'email.complained':
        console.log('Email complained:', payload.data);
        break;
      case 'email.opened':
        console.log('Email opened:', payload.data);
        break;
      case 'email.clicked':
        console.log('Email clicked:', payload.data);
        break;
      default:
        console.log('Unknown webhook type:', payload.type);
    }

    // 返回 200 状态码确认收到 webhook
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// 处理 GET 请求（用于 webhook 验证）
export async function GET() {
  return NextResponse.json({ 
    message: 'Resend webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}

