const { VertexAI } = require('@google-cloud/vertexai');

async function testModels() {
  console.log("Testing available models in Vertex AI...");
  
  const projectId = 'artisan-ai-471601';
  const location = 'us-central1';
  
  try {
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
      keyFilename: './vertex-express-key.json',
    });
    
    // Try different models
    const models = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-image-preview',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    for (const modelName of models) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = vertexAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7,
          }
        });
        
        const result = await model.generateContent("Hello, can you generate an image?");
        const response = await result.response;
        
        console.log(`✅ Model ${modelName} is available`);
        console.log(`Response: ${response.text()}`);
        
        // Check if it can generate images
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          const candidate = candidates[0];
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                console.log(`🎨 Model ${modelName} supports image generation!`);
                break;
              }
            }
          }
        }
        
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error("Error testing models:", error);
  }
}

testModels();
