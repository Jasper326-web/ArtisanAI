// Creem Webhook 签名测试脚本
const crypto = require('crypto');
const https = require('https');

// 配置
const WEBHOOK_URL = 'https://artisans-ai.com/api/creem/webhook';
const WEBHOOK_SECRET = 'whsec_6cWr7Itj977st7aAEM0kfO';

// 生成正确的签名
function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

// 测试用例
const testCases = [
  {
    name: '正常订单 - 有user_id',
    payload: {
      eventType: 'checkout.completed',
      object: {
        order: {
          id: `ord_test_normal_${Date.now()}`,
          amount: 499,
          customer: 'cust_test_normal',
          product: 'prod_hjE2miByilwiAMNFFfRm7'
        },
        customer: {
          email: 'normal@example.com'
        },
        product: {
          id: 'prod_hjE2miByilwiAMNFFfRm7'
        },
        metadata: {
          credits: 300,
          request_id: `test-user-normal-${Date.now()}`
        },
        request_id: `test-user-normal-${Date.now()}`
      }
    }
  },
  {
    name: 'Orphan订单 - 无user_id',
    payload: {
      eventType: 'checkout.completed',
      object: {
        order: {
          id: `ord_test_orphan_${Date.now()}`,
          amount: 999,
          customer: 'cust_test_orphan',
          product: 'prod_hjE2miByilwiAMNFFfRm7'
        },
        customer: {
          email: 'orphan@example.com'
        },
        product: {
          id: 'prod_hjE2miByilwiAMNFFfRm7'
        },
        metadata: {
          credits: 300
        }
      }
    }
  },
  {
    name: '错误签名测试',
    payload: {
      eventType: 'checkout.completed',
      object: {
        order: {
          id: `ord_test_bad_sig_${Date.now()}`,
          amount: 199,
          customer: 'cust_test_bad_sig',
          product: 'prod_hjE2miByilwiAMNFFfRm7'
        }
      }
    },
    useBadSignature: true
  }
];

// 发送webhook请求
function sendWebhook(payload, signature) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'creem-signature': signature
      }
    };

    const req = https.request(WEBHOOK_URL, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log('🚀 开始 Creem Webhook 签名和幂等性测试...\n');
  
  for (const testCase of testCases) {
    console.log(`📋 测试: ${testCase.name}`);
    
    const payload = JSON.stringify(testCase.payload);
    const orderId = testCase.payload.object.order.id;
    
    console.log(`📤 订单ID: ${orderId}`);
    
    // 生成签名
    const signature = testCase.useBadSignature 
      ? 'bad_signature_for_testing'
      : generateSignature(payload, WEBHOOK_SECRET);
    
    console.log(`🔐 使用签名: ${signature.substring(0, 20)}...`);
    
    try {
      // 第一次发送
      console.log('📤 第一次发送...');
      const response1 = await sendWebhook(testCase.payload, signature);
      console.log(`✅ 第一次响应: ${response1.statusCode} - ${response1.body}`);
      
      // 等待1秒
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 第二次发送（测试幂等性）
      console.log('📤 第二次发送（幂等性测试）...');
      const response2 = await sendWebhook(testCase.payload, signature);
      console.log(`✅ 第二次响应: ${response2.statusCode} - ${response2.body}`);
      
      // 验证结果
      if (testCase.useBadSignature) {
        if (response1.statusCode === 400 && response1.body.includes('Invalid signature')) {
          console.log('✅ 错误签名测试通过 - 正确拒绝无效签名\n');
        } else {
          console.log('❌ 错误签名测试失败 - 应该返回400错误\n');
        }
      } else {
        if (response1.statusCode === 200 && response2.statusCode === 200) {
          console.log('✅ 幂等性测试通过 - 重复请求返回相同结果\n');
        } else {
          console.log('❌ 幂等性测试失败\n');
        }
      }
      
    } catch (error) {
      console.error('❌ 测试失败:', error.message, '\n');
    }
  }
  
  console.log('🎯 测试完成！请检查数据库验证结果。');
  console.log('📊 运行 database_fixes.sql 检查数据库状态');
}

// 主函数
async function main() {
  console.log('🔧 Creem Webhook 测试工具');
  console.log(`🌐 目标URL: ${WEBHOOK_URL}`);
  console.log(`🔑 使用Secret: ${WEBHOOK_SECRET.substring(0, 10)}...\n`);
  
  await runTests();
}

main().catch(console.error);
