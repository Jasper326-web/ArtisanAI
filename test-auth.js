const { PredictionServiceClient } = require('@google-cloud/aiplatform');

async function testAuth() {
  console.log("Testing Google Cloud authentication...");
  
  const projectId = 'artisan-ai-471601';
  const location = 'us-central1';
  
  try {
    const client = new PredictionServiceClient({
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
      keyFilename: './vertex-express-key.json',
    });
    
    console.log("Client created successfully");
    
    // Try to list models to test authentication
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models`;
    
    console.log("Testing authentication with endpoint:", endpoint);
    
    // This is a simple test - we'll try to make a request that should fail with a different error if auth works
    const testEndpoint = `projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.5-flash`;
    
    const instance = {
      prompt: "test",
    };

    const request = {
      endpoint: testEndpoint,
      instances: [instance],
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 10,
      },
    };

    console.log("Making test request...");
    const [response] = await client.predict(request);
    console.log("Success! Response:", JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.log("Error details:");
    console.log("- Code:", error.code);
    console.log("- Message:", error.message);
    console.log("- Details:", error.details);
    console.log("- Reason:", error.reason);
    console.log("- Domain:", error.domain);
    
    if (error.code === 7) {
      console.log("\n🔍 PERMISSION_DENIED error - this means authentication worked but permissions are missing");
    } else if (error.message.includes('Could not load the default credentials')) {
      console.log("\n❌ Authentication failed - credentials not found");
    } else {
      console.log("\n✅ Authentication worked, but got a different error:", error.message);
    }
  }
}

testAuth();
