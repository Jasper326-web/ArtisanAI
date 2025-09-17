# Creem 支付集成设置指南

## 1. 环境变量配置

已在 `.env.local` 中添加：
```
CREEM_API_KEY=creem_test_7Pio5ccVdDKTaSz6ijf5Te
```

## 2. Creem 后台设置

### 2.1 创建产品
在 Creem 测试环境中创建以下产品：

1. **入门包产品** ✅ 已完成
   - 产品名称: "Starter Pack - 300 Credits"
   - 产品ID: `prod_j8RS5IyEKO0MiYG2Bdusi`
   - 价格: $4.99
   - 描述: "Perfect for beginners - 300 credits for 6 high-quality images"
   - 测试链接: https://www.creem.io/test/payment/prod_j8RS5IyEKO0MiYG2Bdusi

### 2.2 配置 Webhook
- Webhook URL: `http://localhost:3000/api/creem/webhook` (本地开发)
- 生产环境: `https://your-domain.com/api/creem/webhook`
- 监听事件: `checkout.session.completed`, `payment.succeeded`, `payment.failed`

## 3. 测试支付流程

### 3.1 测试卡号
使用 Creem 提供的测试卡号：
- 卡号: `4242 4242 4242 4242`
- 过期日期: 任意未来日期
- CVV: 任意3位数字

### 3.2 测试流程
1. 访问 `/pricing` 页面
2. 点击"入门包"的"Purchase Now"按钮
3. 系统会重定向到 Creem 结账页面
4. 使用测试卡号完成支付
5. 支付成功后，webhook 会收到通知

## 4. 当前实现状态

### ✅ 已完成
- [x] 定价页面 UI 设计
- [x] 5个套餐展示（仅入门包可用）
- [x] Creem API 集成代码
- [x] Webhook 处理逻辑
- [x] 错误处理和用户反馈
- [x] 多语言支持
- [x] 在 Creem 后台创建产品 ✅
- [x] 配置本地 webhook URL ✅
- [x] 测试 API 集成 ✅

### 🔄 待完成
- [ ] 测试完整支付流程
- [ ] 积分充值逻辑完善
- [ ] 配置生产环境 webhook URL

## 5. API 端点

### 创建结账会话
```
POST /api/creem/checkout
Content-Type: application/json

{
  "plan_id": "starter",
  "price": "$4.99",
  "credits": 300
}
```

### Webhook 处理
```
POST /api/creem/webhook
Content-Type: application/json

{
  "event": "checkout.session.completed",
  "data": { ... }
}
```

## 6. 注意事项

1. **测试模式**: 当前使用 Creem 测试 API (`test-api.creem.io`)
2. **产品限制**: 目前只有入门包 ($4.99) 可用，其他套餐显示"Coming Soon"
3. **用户关联**: 需要完善用户识别逻辑，将支付与用户账户关联
4. **积分充值**: 支付成功后需要调用 Supabase RPC 函数充值积分

## 7. 下一步

1. 在 Creem 后台创建产品
2. 测试支付流程
3. 完善用户识别和积分充值逻辑
4. 添加其他套餐产品
5. 配置生产环境
