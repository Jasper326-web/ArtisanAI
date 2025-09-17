// 最终修复版本的 Vertex AI 测试
const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexAIFinal() {
  console.log("🚀 最终版本的 Vertex AI 测试...");
  
  try {
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("✅ Vertex AI 实例创建成功");
    
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    
    console.log("✅ 模型获取成功");
    
    const result = await model.generateContent('用一句话介绍人工智能');
    const response = await result.response;
    
    console.log("🎉 成功！");
    console.log("📄 完整响应结构:", JSON.stringify(response, null, 2));
    
    // 尝试不同的方法获取文本
    let text = null;
    
    // 方法1: 检查 response 的所有属性
    console.log("\n🔍 检查 response 属性:");
    console.log("- response 类型:", typeof response);
    console.log("- response 属性:", Object.keys(response));
    
    // 方法2: 检查是否有 text 方法
    if (typeof response.text === 'function') {
      text = response.text();
      console.log("📝 方法1 - response.text():", text);
    } else {
      console.log("❌ response.text 不是函数");
    }
    
    // 方法3: 从 candidates 获取
    if (!text && response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log("- 第一个 candidate 属性:", Object.keys(candidate));
      
      if (candidate.content && candidate.content.parts) {
        const textParts = candidate.content.parts.filter(part => part.text);
        text = textParts.map(part => part.text).join(" ");
        console.log("📝 方法2 - 从 candidates 获取:", text);
      }
    }
    
    // 方法4: 检查其他可能的属性
    if (!text) {
      console.log("🔍 检查其他可能的属性:");
      if (response.text) {
        console.log("📝 方法3 - response.text (属性):", response.text);
        text = response.text;
      }
      if (response.content) {
        console.log("📝 方法4 - response.content:", response.content);
      }
      if (response.message) {
        console.log("📝 方法5 - response.message:", response.message);
      }
    }
    
    console.log("\n📊 其他信息:");
    console.log("- 模型版本:", response.modelVersion);
    console.log("- 使用统计:", response.usageMetadata);
    
    if (text) {
      console.log("\n🎊 最终结果:", text);
      return true;
    } else {
      console.log("\n❌ 无法提取文本内容");
      return false;
    }
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    console.error("错误详情:", error);
    return false;
  }
}

// 运行测试
testVertexAIFinal()
  .then(success => {
    if (success) {
      console.log("\n🎊 测试成功：Vertex AI 文本生成功能完全正常！");
      console.log("✅ 认证、权限、API 调用、响应解析都成功！");
    } else {
      console.log("\n💥 测试失败：需要进一步调试");
    }
  })
  .catch(error => {
    console.error("\n🔥 测试过程中发生未预期的错误:", error);
  });
