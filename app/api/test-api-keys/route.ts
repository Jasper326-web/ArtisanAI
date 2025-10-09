import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/generative-ai';
import { getAPIKeyManager } from '@/lib/api-key-manager';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 开始API Key诊断...');
    
    const apiKeyManager = getAPIKeyManager();
    const status = apiKeyManager.getStatus();
    
    console.log('📊 API Key状态:', status);
    
    // 测试每个API Key
    const testResults = [];
    
    for (let i = 0; i < status.totalKeys; i++) {
      try {
        // 临时切换到指定Key进行测试
        const testKey = apiKeyManager['apiKeys'][i];
        const client = new GoogleGenAI({ apiKey: testKey });
        
        console.log(`🧪 测试API Key ${i + 1}...`);
        
        // 发送一个简单的测试请求
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: { parts: [{ text: "Generate a simple red square" }] },
        });
        
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            testResults.push({
              keyIndex: i + 1,
              status: 'success',
              message: 'API Key工作正常',
              hasImage: candidate.content.parts.some(part => part.inlineData),
              hasText: candidate.content.parts.some(part => part.text)
            });
          } else {
            testResults.push({
              keyIndex: i + 1,
              status: 'warning',
              message: 'API Key响应但无内容',
              hasImage: false,
              hasText: false
            });
          }
        } else {
          testResults.push({
            keyIndex: i + 1,
            status: 'error',
            message: 'API Key无响应',
            hasImage: false,
            hasText: false
          });
        }
        
      } catch (error: any) {
        console.error(`❌ API Key ${i + 1} 测试失败:`, error.message);
        
        let errorType = 'unknown';
        let errorMessage = error.message;
        
        if (error.message.includes('quota')) {
          errorType = 'quota_exceeded';
          errorMessage = '配额已用完';
        } else if (error.message.includes('permission')) {
          errorType = 'permission_denied';
          errorMessage = '权限被拒绝';
        } else if (error.message.includes('invalid')) {
          errorType = 'invalid_key';
          errorMessage = '无效的API Key';
        } else if (error.message.includes('rate')) {
          errorType = 'rate_limit';
          errorMessage = '请求频率限制';
        }
        
        testResults.push({
          keyIndex: i + 1,
          status: 'error',
          message: errorMessage,
          errorType: errorType,
          hasImage: false,
          hasText: false
        });
      }
    }
    
    // 统计结果
    const successCount = testResults.filter(r => r.status === 'success').length;
    const errorCount = testResults.filter(r => r.status === 'error').length;
    const warningCount = testResults.filter(r => r.status === 'warning').length;
    
    return NextResponse.json({
      success: true,
      summary: {
        totalKeys: status.totalKeys,
        availableKeys: status.availableKeys,
        failedKeys: status.failedKeys,
        successCount,
        errorCount,
        warningCount
      },
      status: status,
      testResults: testResults,
      recommendations: generateRecommendations(testResults)
    });
    
  } catch (error: any) {
    console.error('API Key诊断失败:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function generateRecommendations(testResults: any[]): string[] {
  const recommendations = [];
  
  const quotaExceeded = testResults.filter(r => r.errorType === 'quota_exceeded').length;
  const rateLimited = testResults.filter(r => r.errorType === 'rate_limit').length;
  const invalidKeys = testResults.filter(r => r.errorType === 'invalid_key').length;
  const permissionDenied = testResults.filter(r => r.errorType === 'permission_denied').length;
  
  if (quotaExceeded > 0) {
    recommendations.push(`⚠️ ${quotaExceeded}个API Key配额已用完，需要等待配额重置或添加新的API Key`);
  }
  
  if (rateLimited > 0) {
    recommendations.push(`⏱️ ${rateLimited}个API Key遇到频率限制，建议增加请求间隔`);
  }
  
  if (invalidKeys > 0) {
    recommendations.push(`🔑 ${invalidKeys}个API Key无效，请检查Key是否正确`);
  }
  
  if (permissionDenied > 0) {
    recommendations.push(`🚫 ${permissionDenied}个API Key权限被拒绝，请检查API权限设置`);
  }
  
  const successCount = testResults.filter(r => r.status === 'success').length;
  if (successCount === 0) {
    recommendations.push(`❌ 所有API Key都无法使用，请检查网络连接和API配置`);
  } else if (successCount < testResults.length / 2) {
    recommendations.push(`⚠️ 只有${successCount}个API Key可用，建议添加更多API Key以提高稳定性`);
  } else {
    recommendations.push(`✅ ${successCount}个API Key工作正常，系统运行良好`);
  }
  
  return recommendations;
}
