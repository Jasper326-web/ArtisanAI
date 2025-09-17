// 测试 Vertex AI 文本生成功能
const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexAISimple() {
  console.log("🚀 开始测试 Vertex AI 文本生成...");
  
  const projectId = 'artisan-ai-471601';
  const location = 'us-central1';
  
  try {
    console.log("📋 配置信息:");
    console.log("- 项目 ID:", projectId);
    console.log("- 位置:", location);
    console.log("- 密钥文件: ./vertex-express-key.json");
    
    // 创建 Vertex AI 客户端
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("✅ Vertex AI 客户端创建成功");
    
    // 获取生成模型
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      }
    });
    
    console.log("✅ 模型配置成功");
    
    // 生成内容
    const prompt = "用一句话介绍人工智能";
    console.log("📝 提示词:", prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log("🎉 成功！响应内容:");
    console.log("📄 文本:", response.text());
    console.log("🔢 模型版本:", response.modelVersion);
    console.log("📊 使用统计:", response.usageMetadata);
    
    return true;
    
  } catch (error) {
    console.error("❌ 测试失败:");
    console.error("错误类型:", error.constructor.name);
    console.error("错误信息:", error.message);
    
    if (error.code) {
      console.error("错误代码:", error.code);
    }
    
    if (error.details) {
      console.error("详细信息:", error.details);
    }
    
    return false;
  }
}

// 运行测试
testVertexAISimple()
  .then(success => {
    if (success) {
      console.log("\n🎊 测试完成：Vertex AI 文本生成功能正常！");
    } else {
      console.log("\n💥 测试失败：需要检查配置");
    }
  })
  .catch(error => {
    console.error("\n🔥 测试过程中发生未预期的错误:", error);
  });
