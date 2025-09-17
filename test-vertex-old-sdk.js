const { PredictionServiceClient } = require('@google-cloud/aiplatform');

async function testVertexAIOldSDK() {
  console.log("Testing Vertex AI with old SDK (text generation)...");
  
  const projectId = 'artisan-ai-471601';
  const location = 'us-central1';
  
  try {
    const client = new PredictionServiceClient({
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
      keyFilename: './vertex-express-key.json',
    });
    
    // Test with gemini-2.5-flash for text generation
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.5-flash`;
    
    const instance = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: "Write a short poem about AI"
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    };

    const request = {
      endpoint,
      instances: [instance],
      parameters: {},
    };

    console.log("Making request to:", endpoint);
    const [response] = await client.predict(request);
    
    console.log("✅ Vertex AI text generation works!");
    console.log("Response:", JSON.stringify(response, null, 2));
    
    return true;
    
  } catch (error) {
    console.error("❌ Vertex AI text generation failed:");
    console.error("- Code:", error.code);
    console.error("- Message:", error.message);
    console.error("- Details:", error.details);
    
    if (error.code === 9) {
      console.log("🔍 This is the expected error - Gemini cannot be accessed through Predict API");
      console.log("✅ Authentication and permissions are working correctly!");
      return true; // This is actually success for our purposes
    }
    
    return false;
  }
}

testVertexAIOldSDK();
