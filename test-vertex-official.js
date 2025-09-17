// 使用官方推荐的方法测试 Vertex AI
const { VertexAI } = require('@google-cloud/vertexai');

async function testOfficialMethod() {
  console.log("🚀 使用官方推荐的方法测试 Vertex AI...");
  
  try {
    // 方法1: 使用环境变量
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './vertex-express-key.json';
    
    console.log("📋 环境变量设置:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    // 创建 Vertex AI 实例
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
    });
    
    console.log("✅ Vertex AI 实例创建成功");
    
    // 获取生成模型
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    
    console.log("✅ 模型获取成功");
    
    // 生成内容
    const result = await model.generateContent('Hello, world!');
    const response = await result.response;
    
    console.log("🎉 成功！");
    console.log("📄 响应:", response.text());
    
    return true;
    
  } catch (error) {
    console.error("❌ 官方方法失败:", error.message);
    
    // 尝试方法2: 直接传递凭据
    console.log("\n🔄 尝试方法2: 直接传递凭据...");
    return await testDirectCredentials();
  }
}

async function testDirectCredentials() {
  try {
    const fs = require('fs');
    const credentials = JSON.parse(fs.readFileSync('./vertex-express-key.json', 'utf8'));
    
    const vertexAI = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1',
      credentials: credentials,
    });
    
    console.log("✅ 直接凭据方法 - Vertex AI 实例创建成功");
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    
    console.log("✅ 直接凭据方法 - 模型获取成功");
    
    const result = await model.generateContent('Hello, world!');
    const response = await result.response;
    
    console.log("🎉 直接凭据方法成功！");
    console.log("📄 响应:", response.text());
    
    return true;
    
  } catch (error) {
    console.error("❌ 直接凭据方法也失败:", error.message);
    
    // 尝试方法3: 使用 keyFilename
    console.log("\n🔄 尝试方法3: 使用 keyFilename...");
    return await testKeyFilename();
  }
}

async function testKeyFilename() {
  try {
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("✅ keyFilename 方法 - Vertex AI 实例创建成功");
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    
    console.log("✅ keyFilename 方法 - 模型获取成功");
    
    const result = await model.generateContent('Hello, world!');
    const response = await result.response;
    
    console.log("🎉 keyFilename 方法成功！");
    console.log("📄 响应:", response.text());
    
    return true;
    
  } catch (error) {
    console.error("❌ keyFilename 方法也失败:", error.message);
    console.error("错误详情:", error);
    
    return false;
  }
}

// 运行测试
testOfficialMethod()
  .then(success => {
    if (success) {
      console.log("\n🎊 测试成功：Vertex AI 可以正常工作！");
    } else {
      console.log("\n💥 所有方法都失败了");
      console.log("💡 建议：");
      console.log("1. 检查服务账号权限");
      console.log("2. 检查项目配置");
      console.log("3. 查看官方文档获取最新示例");
    }
  })
  .catch(error => {
    console.error("\n🔥 测试过程中发生未预期的错误:", error);
  });
