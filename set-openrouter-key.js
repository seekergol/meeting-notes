const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示用户输入OpenRouter API密钥
rl.question('请输入您的OpenRouter API密钥: ', (apiKey) => {
  // 环境变量配置
  const envContent = `# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenRouter API密钥
OPENAI_API_KEY=${apiKey}

# 管理员密钥
ADMIN_SECRET_KEY=admin-secret-key-for-development
`;

  // 写入.env.local文件
  fs.writeFileSync(path.join(__dirname, '.env.local'), envContent, 'utf8');

  console.log('.env.local 文件已创建，已设置您的OpenRouter API密钥');
  console.log('请重新启动应用: npm run dev');
  
  rl.close();
}); 