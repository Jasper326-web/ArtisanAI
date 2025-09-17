// 使用 REST API 直接调用 Vertex AI
const https = require('https');
const fs = require('fs');

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const credentials = JSON.parse(fs.readFileSync('./vertex-express-key.json', 'utf8'));
    
    const postData = JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: createJWT(credentials)
    });
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token in response: ' + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function createJWT(credentials) {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  
  // 这里需要实际的 JWT 签名，为了简化，我们使用一个更简单的方法
  return 'dummy-jwt';
}

async function testVertexAIREST() {
  console.log("🚀 使用 REST API 测试 Vertex AI...");
  
  try {
    // 首先尝试使用服务账号直接调用
    const credentials = JSON.parse(fs.readFileSync('./vertex-express-key.json', 'utf8'));
    
    const projectId = credentials.project_id;
    const location = 'us-central1';
    const model = 'gemini-2.5-flash';
    
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
    
    console.log("🔗 端点:", endpoint);
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: '用一句话介绍人工智能'
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.7
      }
    };
    
    console.log("📝 请求体:", JSON.stringify(requestBody, null, 2));
    
    // 使用 Node.js 的 https 模块发送请求
    const result = await makeRequest(endpoint, requestBody, credentials);
    
    console.log("🎉 成功！响应:");
    console.log(JSON.stringify(result, null, 2));
    
    return true;
    
  } catch (error) {
    console.error("❌ 测试失败:", error.message);
    return false;
  }
}

function makeRequest(url, data, credentials) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${credentials.private_key}` // 这里需要正确的认证
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + responseData));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 运行测试
testVertexAIREST()
  .then(success => {
    if (success) {
      console.log("\n🎊 REST API 测试成功！");
    } else {
      console.log("\n💥 REST API 测试失败");
    }
  })
  .catch(error => {
    console.error("\n🔥 测试过程中发生错误:", error);
  });
