import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 使用服务端角色创建Supabase客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    // 获取请求体
    const body = await request.json();
    const { email, adminKey } = body;

    // 验证管理员密钥 (简单的安全措施)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: '邮箱是必需的' },
        { status: 400 }
      );
    }

    // 查询用户
    const { data: user, error: userError } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '未找到用户', details: userError?.message },
        { status: 404 }
      );
    }

    // 更新用户的email_confirmed_at字段
    const { error: updateError } = await supabaseAdmin
      .from('auth.users')
      .update({ email_confirmed_at: new Date().toISOString() })
      .eq('email', email);

    if (updateError) {
      return NextResponse.json(
        { error: '确认邮箱失败', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `用户 ${email} 的邮箱已成功确认`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '服务器错误', details: error.message },
      { status: 500 }
    );
  }
} 