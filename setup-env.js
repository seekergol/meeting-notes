const fs = require('fs');
const path = require('path');

// 环境变量配置
const envContent = `# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenRouter API密钥
OPENAI_API_KEY=your-openrouter-key

# 管理员密钥
ADMIN_SECRET_KEY=admin-secret-key-for-development
`;

// 写入.env.local文件
fs.writeFileSync(path.join(__dirname, '.env.local'), envContent, 'utf8');

console.log('.env.local 文件已创建，请修改其中的值为您的实际配置');
console.log('特别是将 OPENAI_API_KEY 设置为您的 OpenRouter API 密钥');
console.log('修改完成后，重新启动应用'); 