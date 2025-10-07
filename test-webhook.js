// 测试webhook端点的脚本
const testWebhook = async () => {
  const webhookUrl = 'https://artisans-ai.com/api/creem/webhook';
  
  const testPayload = {
    "id": "evt_test_123",
    "eventType": "checkout.completed",
    "created_at": Date.now(),
    "object": {
      "id": "ch_test_123",
      "object": "checkout",
      "request_id": "test-user-id-123",
      "order": {
        "id": "ord_test_123",
        "amount": 499,
        "status": "paid"
      },
      "product": {
        "id": "prod_7dc3mQLP37qy4ftc7ksbjK",
        "name": "Small Pack"
      },
      "customer": {
        "email": "test@example.com"
      },
      "status": "completed",
      "metadata": {
        "credits": 300
      }
    }
  };

  try {
    console.log('🧪 测试webhook端点...');
    console.log('URL:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'creem-signature': 'test-signature'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 响应内容:', responseText);
    
    if (response.status === 405) {
      console.log('❌ 405错误：方法不被允许');
      console.log('可能原因：');
      console.log('1. 路由配置错误');
      console.log('2. 部署问题');
      console.log('3. URL配置错误');
    } else if (response.status === 200) {
      console.log('✅ Webhook正常工作');
    } else {
      console.log('⚠️ 其他错误:', response.status);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
};

testWebhook();
