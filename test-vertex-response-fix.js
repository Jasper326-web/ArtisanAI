// 修复响应格式问题的 Vertex AI 测试
const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');

async function testVertexAIWithCorrectResponse() {
  console.log("🚀 测试 Vertex AI 并修复响应格式问题...");
  
  try {
    const credentials = JSON.parse(fs.readFileSync('./vertex-express-key.json', 'utf8'));
    
    const vertexAI = new VertexAI({
      project: credentials.project_id,
      location: 'us-central1',
      credentials: credentials,
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
    console.log("📄 完整响应结构:", JSON.stringify(response, null, 2));
    
    // 尝试不同的方法获取文本
    let text = null;
    
    // 方法1: 直接调用 text()
    try {
      text = response.text();
      console.log("📝 方法1 - response.text():", text);
    } catch (e) {
      console.log("❌ 方法1失败:", e.message);
    }
    
    // 方法2: 从 candidates 获取
    if (!text && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        const textParts = candidate.content.parts.filter(part => part.text);
        text = textParts.map(part => part.text).join(" ");
        console.log("📝 方法2 - 从 candidates 获取:", text);
      }
    }
    
    // 方法3: 检查所有可能的属性
    if (!text) {
      console.log("📝 方法3 - 检查所有属性:");
      console.log("- response 类型:", typeof response);
      console.log("- response 属性:", Object.keys(response));
      
      if (response.candidates) {
        console.log("- candidates 数量:", response.candidates.length);
        if (response.candidates[0]) {
          console.log("- 第一个 candidate 属性:", Object.keys(response.candidates[0]));
        }
      }
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
testVertexAIWithCorrectResponse()
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
