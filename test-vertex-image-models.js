// 测试 Vertex AI 中的图像生成模型
const { VertexAI } = require('@google-cloud/vertexai');

async function testImageModels() {
  console.log("🚀 测试 Vertex AI 中的图像生成模型...");
  
  try {
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("✅ Vertex AI 客户端创建成功");
    
    // 测试不同的模型
    const modelsToTest = [
      'gemini-2.5-flash-image-preview',
      'gemini-2.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash-lite'
    ];
    
    for (const modelName of modelsToTest) {
      console.log(`\n🔍 测试模型: ${modelName}`);
      
      try {
        const model = vertexAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens: 10,
            temperature: 0.7,
          }
        });
        
        const result = await model.generateContent('Hello');
        const response = await result.response;
        
        console.log(`✅ ${modelName} 可用`);
        
        // 检查是否支持图像生成
        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts) {
            const hasImageData = candidate.content.parts.some(part => part.inlineData);
            console.log(`📸 支持图像生成: ${hasImageData ? '是' : '否'}`);
          }
        }
        
      } catch (error) {
        console.log(`❌ ${modelName} 不可用: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

// 运行测试
testImageModels();
