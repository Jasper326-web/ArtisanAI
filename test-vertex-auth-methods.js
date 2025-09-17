// 测试不同的 Vertex AI 认证方法
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');

async function testMethod1() {
  console.log("🔧 方法1: 使用环境变量认证");
  try {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './vertex-express-key.json';
    
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
    });
    
    const result = await model.generateContent("Hello");
    const response = await result.response;
    
    console.log("✅ 方法1成功:", response.text());
    return true;
  } catch (error) {
    console.log("❌ 方法1失败:", error.message);
    return false;
  }
}

async function testMethod2() {
  console.log("🔧 方法2: 直接传递凭据");
  try {
    const credentials = JSON.parse(fs.readFileSync('./vertex-express-key.json', 'utf8'));
    
    const vertexAI = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1',
      credentials: credentials,
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
    });
    
    const result = await model.generateContent("Hello");
    const response = await result.response;
    
    console.log("✅ 方法2成功:", response.text());
    return true;
  } catch (error) {
    console.log("❌ 方法2失败:", error.message);
    return false;
  }
}

async function testMethod3() {
  console.log("🔧 方法3: 使用 keyFilename");
  try {
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
      keyFilename: './vertex-express-key.json',
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
    });
    
    const result = await model.generateContent("Hello");
    const response = await result.response;
    
    console.log("✅ 方法3成功:", response.text());
    return true;
  } catch (error) {
    console.log("❌ 方法3失败:", error.message);
    return false;
  }
}

async function testMethod4() {
  console.log("🔧 方法4: 使用 GoogleAuth 库");
  try {
    const { GoogleAuth } = require('google-auth-library');
    
    const auth = new GoogleAuth({
      keyFilename: './vertex-express-key.json',
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    const authClient = await auth.getClient();
    const projectId = await auth.getProjectId();
    
    console.log("认证客户端:", authClient);
    console.log("项目ID:", projectId);
    
    const vertexAI = new VertexAI({
      project: projectId,
      location: 'us-central1',
      authClient: authClient,
    });
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { maxOutputTokens: 10, temperature: 0.7 }
    });
    
    const result = await model.generateContent("Hello");
    const response = await result.response;
    
    console.log("✅ 方法4成功:", response.text());
    return true;
  } catch (error) {
    console.log("❌ 方法4失败:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 开始测试所有认证方法...\n");
  
  const methods = [
    { name: "环境变量认证", fn: testMethod1 },
    { name: "直接传递凭据", fn: testMethod2 },
    { name: "使用 keyFilename", fn: testMethod3 },
    { name: "使用 GoogleAuth 库", fn: testMethod4 },
  ];
  
  for (const method of methods) {
    console.log(`\n--- 测试 ${method.name} ---`);
    try {
      const success = await method.fn();
      if (success) {
        console.log(`🎉 ${method.name} 成功！`);
        return;
      }
    } catch (error) {
      console.log(`💥 ${method.name} 异常:`, error.message);
    }
  }
  
  console.log("\n❌ 所有方法都失败了");
  console.log("💡 可能需要检查 SDK 版本或官方文档");
}

runAllTests();
