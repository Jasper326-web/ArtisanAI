const { PredictionServiceClient } = require('@google-cloud/aiplatform');

async function testVertexAI() {
  try {
    console.log('Testing Vertex AI connection...');
    
    const client = new PredictionServiceClient({
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    });

    const projectId = 'artisan-ai-471601';
    const location = 'us-central1';
    const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.5-flash-image-preview`;

    console.log('Endpoint:', endpoint);

    const request = {
      endpoint,
      instances: [{
        prompt: "A beautiful sunset over mountains"
      }],
      parameters: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    console.log('Sending request...');
    const [response] = await client.predict(request);
    
    console.log('Success! Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

testVertexAI();
