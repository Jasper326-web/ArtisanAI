# Supabase 认证系统设置指南

## 概述

这是一个完整的生产级 React 认证系统，使用 Supabase Auth 实现邮箱+密码注册/登录功能。

## 功能特性

✅ **统一认证模态** - 登录/注册/密码重置在同一个模态中切换  
✅ **邮箱验证流程** - 注册后必须验证邮箱才能登录  
✅ **密码重置** - 完整的忘记密码流程  
✅ **用户友好错误处理** - 将 Supabase 错误映射为中文提示  
✅ **客户端验证** - 邮箱格式、密码长度等验证  
✅ **加载状态** - 所有异步操作都有加载指示器  
✅ **多语言支持** - 集成现有的语言上下文  

## 文件结构

```
components/
├── auth-modal.tsx          # 主认证模态组件
app/
├── email-verified/         # 邮箱验证成功页面
│   └── page.tsx
├── update-password/        # 密码重置页面
│   └── page.tsx
└── register/              # 独立注册页面（可选）
    └── page.tsx
```

## 环境变量配置

在 `.env.local` 中设置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase 配置

### 1. 认证设置

在 Supabase Dashboard > Authentication > Settings 中：

- **Site URL**: `http://localhost:3000` (开发环境)
- **Redirect URLs**: 
  - `http://localhost:3000/email-verified` (生产环境替换为你的域名)
  - `http://localhost:3000/update-password`

### 2. SMTP 配置（生产环境必需）

在 Supabase Dashboard > Authentication > Settings > SMTP Settings：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SENDER_NAME=Your App Name
```

**重要**: 生产环境必须配置 SMTP，否则验证邮件无法发送。

### 3. 邮箱模板配置

在 Supabase Dashboard > Authentication > Email Templates 中自定义：

- **Confirm signup** - 注册确认邮件
- **Reset password** - 密码重置邮件

## 使用方法

### 1. 基本使用

```tsx
import { AuthModal } from '@/components/auth-modal';
import { useState } from 'react';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div>
      <button onClick={() => setShowAuth(true)}>
        登录/注册
      </button>
      
      <AuthModal 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          console.log('登录成功');
          setShowAuth(false);
        }}
      />
    </div>
  );
}
```

### 2. 集成到现有导航

```tsx
// 在 navigation.tsx 中
import { AuthModal } from '@/components/auth-modal';

export function Navigation() {
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <nav>
      {user ? (
        <button onClick={() => supabase.auth.signOut()}>
          退出登录
        </button>
      ) : (
        <button onClick={() => setShowAuth(true)}>
          登录
        </button>
      )}
      
      <AuthModal 
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          // 刷新用户状态
          checkUser();
          setShowAuth(false);
        }}
      />
    </nav>
  );
}
```

## 用户流程

### 注册流程
1. 用户点击"注册"
2. 填写邮箱、密码、确认密码、姓名
3. 点击"注册"按钮
4. 显示绿色提示："账户已注册，请前往邮箱验证以完成注册"
5. 用户收到验证邮件
6. 点击邮件中的链接跳转到 `/email-verified`
7. 显示"邮箱验证成功，请返回登录页面手动登录"
8. 用户返回登录页面手动登录

### 登录流程
1. 用户输入邮箱和密码
2. 点击"登录"
3. 成功则触发 `onSuccess` 回调
4. 失败则显示友好的错误提示

### 密码重置流程
1. 用户点击"忘记密码？"
2. 输入邮箱地址
3. 点击"发送重置邮件"
4. 显示"重置密码邮件已发送，请前往邮箱完成操作"
5. 用户收到重置邮件
6. 点击邮件中的链接跳转到 `/update-password`
7. 设置新密码
8. 自动跳转到登录页面

## 错误处理

系统将 Supabase 错误映射为中文友好提示：

- `Invalid login credentials` → "邮箱或密码不正确，请重试"
- `User already registered` → "该邮箱已被注册。若您未收到验证邮件，请点击重新发送验证邮件"
- `Email not authorized` → "系统当前无法发送验证邮件，请联系管理员或稍后重试"
- `Rate limit` → "操作过于频繁，请稍后重试"
- 网络错误 → "网络或服务器异常，请稍后再试"

## 测试流程

### 手动测试步骤

1. **注册测试**：
   ```bash
   # 启动开发服务器
   npm run dev
   
   # 访问 http://localhost:3000
   # 点击登录按钮
   # 切换到注册表单
   # 填写测试邮箱和密码
   # 点击注册
   # 检查邮箱是否收到验证邮件
   ```

2. **邮箱验证测试**：
   ```bash
   # 点击邮件中的验证链接
   # 应该跳转到 /email-verified 页面
   # 显示"邮箱验证成功"
   # 点击"返回登录页面"
   # 使用相同邮箱密码登录
   ```

3. **密码重置测试**：
   ```bash
   # 在登录页面点击"忘记密码？"
   # 输入已注册的邮箱
   # 点击"发送重置邮件"
   # 检查邮箱是否收到重置邮件
   # 点击邮件中的重置链接
   # 设置新密码
   # 使用新密码登录
   ```

## 生产环境部署

### 1. 更新重定向 URL

在生产环境中，需要更新 Supabase 配置：

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: 
  - `https://yourdomain.com/email-verified`
  - `https://yourdomain.com/update-password`

### 2. 配置自定义域名 SMTP

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
SMTP_SENDER_NAME=Your App Name
```

### 3. 设置 SPF/DKIM 记录

在域名 DNS 中设置：

```
# SPF 记录
TXT @ "v=spf1 include:amazonses.com ~all"

# DKIM 记录（从 SMTP 提供商获取）
```

## 安全注意事项

1. **邮箱验证必需** - 用户必须验证邮箱才能登录
2. **会话管理** - 使用 Supabase 的内置会话管理
3. **密码强度** - 客户端验证至少8位密码
4. **错误信息** - 不暴露敏感的系统信息
5. **重定向安全** - 验证重定向 URL 的合法性

## 故障排除

### 常见问题

1. **验证邮件未收到**：
   - 检查垃圾邮件文件夹
   - 确认 SMTP 配置正确
   - 检查 Supabase 日志

2. **重定向失败**：
   - 确认 Supabase 中的重定向 URL 配置
   - 检查域名是否正确

3. **会话无效**：
   - 确认 Supabase 客户端配置
   - 检查环境变量

### 调试技巧

```tsx
// 在组件中添加调试日志
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current session:', session);
  };
  checkSession();
}, []);
```

## 扩展功能

### 1. 添加社交登录

```tsx
// 在 auth-modal.tsx 中添加
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
};
```

### 2. 添加用户资料管理

```tsx
// 创建用户资料页面
const updateProfile = async (updates) => {
  const { error } = await supabase.auth.updateUser({
    data: updates,
  });
};
```

### 3. 添加多因素认证

```tsx
// 启用 MFA
const enableMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });
};
```

## 总结

这个认证系统提供了完整的用户注册、登录、邮箱验证和密码重置功能，遵循最佳安全实践，并提供了友好的用户体验。所有代码都是生产就绪的，可以直接集成到现有项目中。
