# Vertex AI 商用部署指南

## 🏢 为什么使用 Vertex AI？

### AI Studio vs Vertex AI
- **AI Studio**: 仅用于开发/测试，有严格配额限制
- **Vertex AI**: 企业级服务，适合商用，更高配额和性能

## 🚀 设置步骤

### 1. 创建 Google Cloud 项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 记录项目ID

### 2. 启用 Vertex AI API
1. 在左侧菜单选择 "APIs & Services" > "Library"
2. 搜索 "Vertex AI API"
3. 点击 "Enable"

### 3. 设置计费
1. 左侧菜单选择 "Billing"
2. 点击 "Link a billing account"
3. 添加付款方式

### 4. 创建服务账户
1. 左侧菜单选择 "IAM & Admin" > "Service Accounts"
2. 点击 "Create Service Account"
3. 设置名称和描述
4. 分配角色：`Vertex AI User`
5. 创建并下载JSON密钥文件

### 5. 配置环境变量

#### 开发环境 (.env.local)
```bash
# AI Studio (开发用)
GOOGLE_API_KEY=your_ai_studio_key

# Vertex AI (生产用)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

#### 生产环境
```bash
# 强制使用 Vertex AI
USE_VERTEX_AI=true
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## 🔧 代码配置

### 自动切换逻辑
```typescript
// 开发环境: 使用 AI Studio
// 生产环境: 使用 Vertex AI
const useVertexAI = process.env.NODE_ENV === 'production' || 
                   process.env.USE_VERTEX_AI === 'true' ||
                   !!process.env.GOOGLE_CLOUD_PROJECT_ID;
```

### 手动切换
```bash
# 强制使用 Vertex AI
export USE_VERTEX_AI=true

# 强制使用 AI Studio
export USE_VERTEX_AI=false
```

## 💰 定价对比

### AI Studio (免费层)
- 每分钟: 15次请求
- 每天: 1,500次请求
- 仅用于开发测试

### Vertex AI (付费)
- 更高配额限制
- 按使用量计费
- 企业级SLA
- 数据隐私保护

## 🚀 部署到生产环境

### 1. 设置环境变量
```bash
# 生产环境变量
NODE_ENV=production
USE_VERTEX_AI=true
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json
```

### 2. 上传服务账户密钥
将下载的JSON密钥文件上传到服务器

### 3. 验证部署
```bash
# 检查当前使用的服务
curl -X POST "https://your-domain.com/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "prompt": "test"}'
```

## 📊 监控和优化

### 1. 使用量监控
- Google Cloud Console > Vertex AI > Usage
- 设置预算告警

### 2. 性能优化
- 实现图像缓存
- 批量处理请求
- 压缩图像输出

### 3. 成本控制
- 设置每日/每月预算限制
- 监控异常使用
- 优化提示词长度

## 🔒 安全最佳实践

1. **服务账户权限**: 最小权限原则
2. **密钥管理**: 使用密钥管理服务
3. **网络安全**: 配置VPC和防火墙
4. **数据加密**: 启用传输和存储加密

## 🆘 故障排除

### 常见问题
1. **认证失败**: 检查服务账户密钥
2. **配额超限**: 升级计费计划
3. **API不可用**: 检查区域设置
4. **权限不足**: 验证IAM角色

### 调试命令
```bash
# 检查环境变量
echo $GOOGLE_CLOUD_PROJECT_ID
echo $GOOGLE_APPLICATION_CREDENTIALS

# 测试认证
gcloud auth application-default print-access-token

# 检查API状态
gcloud services list --enabled --filter="name:aiplatform.googleapis.com"
```

## 📞 支持资源

- [Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
- [Gemini API 文档](https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini)
- [定价计算器](https://cloud.google.com/products/calculator)
- [支持中心](https://cloud.google.com/support)
