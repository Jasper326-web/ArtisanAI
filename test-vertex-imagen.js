// 测试 Vertex AI 中的 Imagen 模型
const { VertexAI } = require('@google-cloud/vertexai');

async function testImagenModels() {
  console.log("🚀 测试 Vertex AI 中的 Imagen 模型...");
  
  try {
    const vertexAI = new VertexAI({
      project: 'artisan-ai-471601',
      location: 'us-central1',
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("✅ Vertex AI 客户端创建成功");
    
    // 测试 Imagen 模型
    const imagenModels = [
      'imagegeneration@006',
      'imagegeneration@005',
      'imagegeneration@004',
      'imagen-3.0-generate-001',
      'imagen-3.0-fast-generate-001',
      'imagen-3.0-fast-generate-002'
    ];
    
    for (const modelName of imagenModels) {
      console.log(`\n🔍 测试 Imagen 模型: ${modelName}`);
      
      try {
        const model = vertexAI.getGenerativeModel({
          model: modelName,
        });
        
        console.log(`✅ ${modelName} 模型配置成功`);
        
        // 尝试生成图像
        const result = await model.generateContent('A beautiful sunset over mountains');
        const response = await result.response;
        
        console.log(`🎉 ${modelName} 可用！`);
        console.log("📄 响应结构:", JSON.stringify(response, null, 2));
        
      } catch (error) {
        console.log(`❌ ${modelName} 不可用: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
  }
}

// 运行测试
testImagenModels();
