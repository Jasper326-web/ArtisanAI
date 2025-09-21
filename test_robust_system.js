// 健壮交易系统测试脚本
const crypto = require('crypto');

// 模拟测试数据
const TEST_USER_ID = 'test-user-robust-' + Date.now();
const TEST_PROMPT = 'A beautiful sunset over mountains';

// 生成交易ID
function generateTransactionId(userId, prompt) {
  const timestamp = Date.now();
  const promptHash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);
  return `gen_${userId.substring(0, 8)}_${timestamp}_${promptHash}`;
}

// 测试场景
const testScenarios = [
  {
    name: '正常生成测试',
    description: '测试正常的图像生成流程',
    request: {
      user_id: TEST_USER_ID,
      prompt: TEST_PROMPT
    }
  },
  {
    name: '重复交易测试',
    description: '测试相同交易ID的幂等性',
    request: {
      user_id: TEST_USER_ID,
      prompt: TEST_PROMPT,
      transaction_id: generateTransactionId(TEST_USER_ID, TEST_PROMPT)
    }
  },
  {
    name: '积分不足测试',
    description: '测试积分不足时的处理',
    request: {
      user_id: 'user-with-no-credits',
      prompt: TEST_PROMPT
    }
  },
  {
    name: '重试机制测试',
    description: '测试失败后的重试机制',
    request: {
      user_id: TEST_USER_ID,
      prompt: 'This prompt will fail to generate an image',
      transaction_id: generateTransactionId(TEST_USER_ID, 'retry-test')
    }
  }
];

// 发送请求到本地API
async function testRobustAPI(request, scenarioName) {
  try {
    console.log(`\n🧪 测试: ${scenarioName}`);
    console.log(`📋 请求数据:`, JSON.stringify(request, null, 2));
    
    const response = await fetch('http://localhost:3000/api/generate-robust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    console.log(`📊 响应状态: ${response.status}`);
    console.log(`📄 响应数据:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log(`✅ 测试通过: ${scenarioName}`);
    } else {
      console.log(`❌ 测试失败: ${scenarioName} - ${data.error}`);
    }
    
    return { success: response.ok, data, status: response.status };
    
  } catch (error) {
    console.log(`💥 测试错误: ${scenarioName} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 测试交易状态检查
async function testTransactionStatus(transactionId) {
  try {
    console.log(`\n🔍 检查交易状态: ${transactionId}`);
    
    const response = await fetch(`http://localhost:3000/api/transaction-status?transaction_id=${transactionId}`);
    const data = await response.json();
    
    console.log(`📊 交易状态:`, JSON.stringify(data, null, 2));
    return data;
    
  } catch (error) {
    console.log(`❌ 状态检查失败: ${error.message}`);
    return null;
  }
}

// 测试用户交易历史
async function testUserTransactions(userId) {
  try {
    console.log(`\n📊 获取用户交易历史: ${userId}`);
    
    const response = await fetch(`http://localhost:3000/api/user-transactions?user_id=${userId}&limit=10`);
    const data = await response.json();
    
    console.log(`📋 交易历史:`, JSON.stringify(data, null, 2));
    return data;
    
  } catch (error) {
    console.log(`❌ 历史查询失败: ${error.message}`);
    return null;
  }
}

// 主测试函数
async function runRobustSystemTests() {
  console.log('🚀 开始健壮交易系统测试');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // 运行所有测试场景
  for (const scenario of testScenarios) {
    const result = await testRobustAPI(scenario.request, scenario.name);
    results.push({
      scenario: scenario.name,
      ...result
    });
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 测试交易状态检查（如果有交易ID）
  const transactionsWithId = results.filter(r => r.data?.transaction_id);
  if (transactionsWithId.length > 0) {
    await testTransactionStatus(transactionsWithId[0].data.transaction_id);
  }
  
  // 测试用户交易历史
  await testUserTransactions(TEST_USER_ID);
  
  // 汇总测试结果
  console.log('\n🎯 测试结果汇总');
  console.log('=' .repeat(60));
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`📊 总测试数: ${totalTests}`);
  console.log(`✅ 通过测试: ${passedTests}`);
  console.log(`❌ 失败测试: ${totalTests - passedTests}`);
  console.log(`📈 通过率: ${(passedTests / totalTests * 100).toFixed(1)}%`);
  
  console.log('\n📋 详细结果:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.scenario}: ${result.success ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('\n🔧 下一步:');
  console.log('1. 在 Supabase 控制台运行 robust_transaction_system.sql');
  console.log('2. 启动 Next.js 开发服务器: npm run dev');
  console.log('3. 运行此测试脚本: node test_robust_system.js');
  console.log('4. 检查数据库中的交易记录');
}

// 运行测试
runRobustSystemTests().catch(console.error);
