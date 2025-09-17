const { VertexAI } = require('@google-cloud/vertexai');

async function testVertexAIText() {
  console.log("Testing Vertex AI with text generation...");
  
  const projectId = 'artisan-ai-471601';
  const location = 'us-central1';
  
  try {
    const vertexAI = new VertexAI({
      project: projectId,
      location: location,
      keyFilename: './vertex-express-key.json',
    });
    
    // Test with gemini-2.5-flash (text generation)
    console.log("Testing gemini-2.5-flash for text generation...");
    const model = vertexAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    });
    
    const result = await model.generateContent("Write a short poem about AI");
    const response = await result.response;
    
    console.log("✅ Vertex AI text generation works!");
    console.log("Response:", response.text());
    console.log("Model version:", response.modelVersion);
    console.log("Usage metadata:", response.usageMetadata);
    
    return true;
    
  } catch (error) {
    console.error("❌ Vertex AI text generation failed:", error.message);
    return false;
  }
}

testVertexAIText();
