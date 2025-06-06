import { createClient } from '@supabase/supabase-js'

// 使用默认值确保即使没有环境变量也能创建客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-anon-key'

// 检查是否配置了环境变量
const isMissingConfig = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 只在客户端输出警告
if (typeof window !== 'undefined' && isMissingConfig) {
  console.warn('缺少Supabase配置，应用将使用模拟数据运行，某些功能可能不可用')
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// 模拟用户数据（用于开发测试）
const mockUser = {
  id: 'mock-user-id',
  phone: '+8613800138000',
  email: 'test@example.com',
  user_metadata: {
    name: '测试用户'
  },
  app_metadata: {},
  aud: 'authenticated'
}

// 检查是否使用模拟模式
export const useMockMode = () => {
  return isMissingConfig
}

// 邮箱密码注册
export async function signUpWithEmail(email: string, password: string, metadata?: { name?: string }) {
  try {
    // 检查是否使用模拟模式
    if (useMockMode()) {
      // 使用模拟数据
      console.log('使用模拟数据：注册邮箱', email)
      
      // 在本地存储中设置模拟注册状态
      if (typeof localStorage !== 'undefined') {
        const mockRegisteredUser = {
          ...mockUser,
          email,
          user_metadata: {
            ...mockUser.user_metadata,
            ...metadata
          }
        }
        localStorage.setItem('mock_registered', 'true')
        localStorage.setItem('mock_user', JSON.stringify(mockRegisteredUser))
      }
      
      return { data: { user: mockUser, session: null }, error: null }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('注册错误:', error.message)
    return { data: null, error }
  }
}

// 邮箱密码登录
export async function signInWithEmail(email: string, password: string) {
  try {
    // 检查是否使用模拟模式
    if (useMockMode()) {
      // 使用模拟数据
      console.log('使用模拟数据：登录邮箱', email)
      
      // 在本地存储中设置模拟登录状态
      if (typeof localStorage !== 'undefined') {
        const mockRegisteredUser = {
          ...mockUser,
          email
        }
        localStorage.setItem('mock_logged_in', 'true')
        localStorage.setItem('mock_user', JSON.stringify(mockRegisteredUser))
      }
      
      return { 
        data: { 
          user: mockUser,
          session: { 
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000
          } 
        }, 
        error: null 
      }
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('登录错误:', error.message)
    return { data: null, error }
  }
}

// 手机号验证相关函数
export async function signInWithPhone(phone: string) {
  try {
    // 检查是否使用模拟模式
    if (useMockMode()) {
      // 使用模拟数据
      console.log('使用模拟数据：发送验证码到', phone)
      return { data: { phone }, error: null }
    }
    
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('登录错误:', error.message)
    return { data: null, error }
  }
}

// 验证OTP代码
export async function verifyOTP(phone: string, token: string) {
  try {
    // 检查是否使用模拟模式
    if (useMockMode()) {
      // 使用模拟数据
      console.log('使用模拟数据：验证码', token, '用于手机号', phone)
      // 模拟正确的验证码为 123456
      if (token === '123456') {
        // 在本地存储中设置模拟登录状态
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('mock_logged_in', 'true')
          localStorage.setItem('mock_user', JSON.stringify(mockUser))
        }
        return { 
          data: { 
            user: mockUser,
            session: { 
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000
            } 
          }, 
          error: null 
        }
      } else {
        return { data: null, error: new Error('验证码错误') }
      }
    }
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('OTP验证错误:', error.message)
    return { data: null, error }
  }
}

// 退出登录
export async function signOut() {
  try {
    // 检查是否使用模拟模式
    if (useMockMode()) {
      // 使用模拟数据
      console.log('使用模拟数据：退出登录')
      // 清除本地存储中的模拟登录状态
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('mock_logged_in')
        localStorage.removeItem('mock_user')
        localStorage.removeItem('mock_registered')
      }
      return { error: null }
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('退出登录错误:', error.message)
    return { error }
  }
}

// 获取当前用户
export async function getCurrentUser() {
  try {
    // 检查是否使用模拟模式
    if (useMockMode()) {
      // 使用模拟数据
      console.log('使用模拟数据：获取当前用户')
      // 检查本地存储是否有模拟登录状态
      if (typeof localStorage !== 'undefined') {
        const mockLoggedIn = localStorage.getItem('mock_logged_in')
        if (mockLoggedIn === 'true') {
          const savedUser = localStorage.getItem('mock_user')
          const user = savedUser ? JSON.parse(savedUser) : mockUser
          return { user, error: null }
        }
      }
      return { user: null, error: null }
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error: any) {
    console.error('获取用户信息错误:', error.message)
    return { user: null, error }
  }
} 