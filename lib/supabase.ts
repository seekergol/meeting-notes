import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 邮箱密码注册
export async function signUpWithEmail(email: string, password: string, metadata?: { name?: string }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })
  return { data, error }
}

// 邮箱密码登录
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// 手机号登录 (发送验证码)
export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  })
  return { data, error }
}

// 验证手机验证码
export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  return { data, error }
}

// 退出登录
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// 获取当前登录的用户
export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user ?? null
}

// 重新发送确认邮件
export async function resendConfirmationEmail(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    return { data, error };
}

// 检查用户的邮箱是否已验证
export async function checkEmailConfirmed(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return !!user.email_confirmed_at;
}

/**
 * 直接从Supabase数据库中获取确认链接 (需要管理员权限)
 * @param email 用户的邮箱
 * @returns 确认链接或null
 */
async function getDirectConfirmationLink(email: string): Promise<string | null> {
  // 注意：此操作需要直接查询数据库，需要开启行级安全策略或使用service_role密钥
  // 在客户端直接调用此函数是不安全的，应该在后端API路由中实现
  console.warn('getDirectConfirmationLink需要在安全的后端环境中调用');
  return null; 
}

/**
 * 自动确认用户邮箱 (仅用于开发环境)
 * @param email 用户的邮箱
 * @returns 是否成功
 */
async function autoConfirmEmail(email: string): Promise<boolean> {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('autoConfirmEmail只能在开发环境中使用');
    return false;
  }
  
  try {
    // 这是一个模拟操作，实际开发中你可能需要一个后端端点来完成
    // 例如，调用一个API路由，该路由使用Supabase admin client来更新用户
    console.log(`开发模式：正在尝试自动确认邮箱 ${email}...`);
    
    // 模拟后端调用
    const response = await fetch('/api/confirm-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (response.ok) {
      console.log(`邮箱 ${email} 已自动确认`);
      return true;
    } else {
      console.error(`自动确认邮箱 ${email} 失败`);
      return false;
    }
  } catch (error) {
    console.error('自动确认邮箱时出错:', error);
    return false;
  }
}

/**
 * 一个安全的API调用包装器，增加了重试逻辑和延迟
 * @param apiCallFn 要执行的API调用函数
 * @param retryCount 当前重试次数
 * @param maxRetries 最大重试次数
 * @param initialDelay 初始延迟时间（毫秒）
 * @returns API调用的结果
 */
export async function safeApiCall<T>(
  apiCallFn: () => Promise<{ data: T | null, error: any }>,
  retryCount = 0,
  maxRetries = 3,
  initialDelay = 1000
): Promise<{ data: T | null, error: any }> {
  try {
    return await apiCallFn();
  } catch (err) {
    const error = err as any;
    // 如果达到最大重试次数，则抛出错误
    if (retryCount >= maxRetries) {
      console.error(`API调用失败，已达最大重试次数: ${error.message}`);
      return { data: null, error: { message: `API调用失败: ${error.message}` } };
    }
    
    // 如果是网络错误或服务器错误，则进行重试
    if (error.message?.includes('network') || error.status >= 500) {
      const delay = initialDelay * Math.pow(2, retryCount);
      console.log(`API调用失败，将在 ${delay}ms 后重试... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeApiCall(apiCallFn, retryCount + 1, maxRetries, initialDelay);
    }
    
    // 对于其他类型的错误（如4xx客户端错误），直接返回
    return { data: null, error };
  }
}

// --- 会议记录数据库操作 ---

interface MeetingData {
    user_id: string;
    title: string;
    summary: string;
    content: string; // 完整的转写文本
    department?: string; // <-- 新增部门字段
}

/**
 * 添加一条新的会议记录
 * @param meetingData 会议数据
 */
export async function addMeeting(meetingData: MeetingData) {
    const { data, error } = await supabase
        .from('meetings')
        .insert([
            { ...meetingData, meeting_date: new Date().toISOString() }
        ])
        .select()

    return { data, error }
}

/**
 * 获取指定用户的所有会议记录 (已更新，增加搜索功能)
 * @param userId 用户的ID
 * @param searchQuery 搜索关键词 (可选)
 */
export async function getMeetings(userId: string, searchQuery?: string) {
    let query = supabase
        .from('meetings')
        .select('*')
        .eq('user_id', userId);

    // 如果有搜索词，则增加搜索条件
    if (searchQuery && searchQuery.trim()) {
        const cleanedQuery = searchQuery.trim();
        // 在 title, summary, content, 和 department 中进行不区分大小写的模糊搜索
        query = query.or(
            `title.ilike.%${cleanedQuery}%,` +
            `summary.ilike.%${cleanedQuery}%,` +
            `content.ilike.%${cleanedQuery}%,` +
            `department.ilike.%${cleanedQuery}%`
        );
    }

    // 总是按创建时间降序排序
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error }
}

export const getMeetingById = async (meetingId: number, userId: string) => {
  return await supabase
    .from('meetings')
    .select('*')
    .eq('id', meetingId)
    .eq('user_id', userId)
    .single();
}