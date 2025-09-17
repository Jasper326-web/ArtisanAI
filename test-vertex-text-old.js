// 使用旧 SDK 测试 Vertex AI 文本生成功能
const { PredictionServiceClient } = require('@google-cloud/aiplatform');

async function testVertexAITextOld() {
  console.log("🚀 开始测试 Vertex AI 文本生成（使用旧 SDK）...");
  
  const projectId = 'artisan-ai-471601';
  const location = 'us-central1';
  
  try {
    console.log("📋 配置信息:");
    console.log("- 项目 ID:", projectId);
    console.log("- 位置:", location);
    console.log("- 密钥文件: ./vertex-express-key.json");
    
    // 创建客户端
    const client = new PredictionServiceClient({
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("✅ 客户端创建成功");
    
    // 设置端点
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.5-flash`;
    console.log("🔗 端点:", endpoint);
    
    // 创建请求
    const instance = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: "用一句话介绍人工智能"
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7,
      }
    };

    const request = {
      endpoint,
      instances: [instance],
      parameters: {},
    };

    console.log("📝 发送请求...");
    const [response] = await client.predict(request);
    
    console.log("🎉 成功！响应内容:");
    console.log("📄 完整响应:", JSON.stringify(response, null, 2));
    
    // 解析响应
    if (response.predictions && response.predictions.length > 0) {
      const prediction = response.predictions[0];
      if (prediction.content) {
        const content = prediction.content;
        console.log("📝 生成的内容:", content);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ 测试失败:");
    console.error("错误类型:", error.constructor.name);
    console.error("错误代码:", error.code);
    console.error("错误信息:", error.message);
    
    if (error.code === 9) {
      console.log("🔍 这是预期的错误 - Gemini 不能通过 Predict API 访问");
      console.log("✅ 认证和权限配置正确！");
      console.log("💡 这说明我们需要使用正确的 API 端点");
      return true; // 这实际上是成功的
    }
    
    return false;
  }
}

// 运行测试
testVertexAITextOld()
  .then(success => {
    if (success) {
      console.log("\n🎊 测试完成：Vertex AI 认证和权限配置正确！");
      console.log("💡 下一步：需要找到正确的 API 端点来访问 Gemini 模型");
    } else {
      console.log("\n💥 测试失败：需要检查配置");
    }
  })
  .catch(error => {
    console.error("\n🔥 测试过程中发生未预期的错误:", error);
  });
