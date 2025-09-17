// 修复响应格式问题的 Vertex AI 测试
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');

async function testVertexAIFixed() {
  console.log("🚀 开始测试 Vertex AI（修复版本）...");
  
  try {
    // 读取服务账号文件
    const serviceAccount = JSON.parse(fs.readFileSync('./vertex-express-key.json', 'utf8'));
    
    const vertexAI = new VertexAI({
      project: serviceAccount.project_id,
      location: 'us-central1',
      credentials: serviceAccount,
    });
    
    console.log("✅ Vertex AI 客户端创建成功");
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      }
    });
    
    console.log("✅ 模型配置成功");
    
    const prompt = "用一句话介绍人工智能";
    console.log("📝 提示词:", prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log("🎉 成功！响应内容:");
    console.log("📄 完整响应:", JSON.stringify(response, null, 2));
    
    // 尝试不同的方法获取文本
    if (response.text) {
      console.log("📝 方法1 - response.text():", response.text());
    } else if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        const textParts = candidate.content.parts.filter(part => part.text);
        const text = textParts.map(part => part.text).join(" ");
        console.log("📝 方法2 - 从 candidates 获取:", text);
      }
    } else {
      console.log("📝 响应结构:", Object.keys(response));
    }
    
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
    
    return false;
  }
}

// 运行测试
testVertexAIFixed()
  .then(success => {
    if (success) {
      console.log("\n🎊 测试完成：Vertex AI 文本生成功能正常！");
      console.log("✅ 认证、权限、API 调用都成功！");
    } else {
      console.log("\n💥 测试失败：需要进一步调试");
    }
  })
  .catch(error => {
    console.error("\n🔥 测试过程中发生未预期的错误:", error);
  });
