/**
 * 网络工具类 - 提供网络错误处理和重试机制
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
}

export interface NetworkError extends Error {
  code?: string;
  status?: number;
  isNetworkError?: boolean;
  isRetryable?: boolean;
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(error: any): boolean {
  // 网络相关错误
  if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
    return true;
  }
  
  // 网络变化错误
  if (error?.message?.includes('ERR_NETWORK_CHANGED')) {
    return true;
  }
  
  // 连接超时
  if (error?.message?.includes('timeout') || error?.message?.includes('TIMEOUT')) {
    return true;
  }
  
  // 连接被拒绝
  if (error?.message?.includes('ECONNREFUSED') || error?.message?.includes('ERR_CONNECTION_REFUSED')) {
    return true;
  }
  
  // DNS 解析失败
  if (error?.message?.includes('ERR_NAME_NOT_RESOLVED') || error?.message?.includes('ENOTFOUND')) {
    return true;
  }
  
  // HTTP 状态码
  if (error?.status) {
    // 5xx 服务器错误通常可以重试
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    // 429 请求过多
    if (error.status === 429) {
      return true;
    }
    // 408 请求超时
    if (error.status === 408) {
      return true;
    }
  }
  
  return false;
}

/**
 * 创建网络错误对象
 */
export function createNetworkError(error: any, response?: Response): NetworkError {
  const networkError = new Error(error?.message || 'Network error') as NetworkError;
  
  networkError.code = error?.code || 'NETWORK_ERROR';
  networkError.status = response?.status || error?.status;
  networkError.isNetworkError = true;
  networkError.isRetryable = isRetryableError(error);
  
  return networkError;
}

/**
 * 计算重试延迟（指数退避）
 */
export function calculateRetryDelay(attempt: number, options: RetryOptions): number {
  const { baseDelay = 1000, maxDelay = 30000, backoffFactor = 2 } = options;
  
  const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 带重试的 fetch 请求
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = isRetryableError
  } = retryOptions;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`🌐 Fetch attempt ${attempt}/${maxRetries + 1} for ${url}`);
      
      const response = await fetch(url, {
        ...options,
        // 添加超时控制
        signal: AbortSignal.timeout(30000) // 30秒超时
      });
      
      // 如果响应成功，直接返回
      if (response.ok) {
        console.log(`✅ Fetch successful on attempt ${attempt}`);
        return response;
      }
      
      // 检查是否应该重试
      const error = createNetworkError(
        new Error(`HTTP ${response.status}: ${response.statusText}`),
        response
      );
      
      if (attempt <= maxRetries && retryCondition(error)) {
        const delayMs = calculateRetryDelay(attempt, { baseDelay, maxDelay, backoffFactor });
        console.log(`🔄 Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await delay(delayMs);
        continue;
      }
      
      // 不重试或达到最大重试次数
      throw error;
      
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Fetch attempt ${attempt} failed:`, error);
      
      // 检查是否应该重试
      if (attempt <= maxRetries && retryCondition(error)) {
        const delayMs = calculateRetryDelay(attempt, { baseDelay, maxDelay, backoffFactor });
        console.log(`🔄 Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
        await delay(delayMs);
        continue;
      }
      
      // 不重试或达到最大重试次数
      break;
    }
  }
  
  // 所有重试都失败了
  const finalError = createNetworkError(lastError);
  console.error(`💥 All fetch attempts failed for ${url}:`, finalError);
  throw finalError;
}

/**
 * 带重试的 JSON 请求
 */
export async function fetchJsonWithRetry<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }, retryOptions);
  
  if (!response.ok) {
    throw createNetworkError(
      new Error(`HTTP ${response.status}: ${response.statusText}`),
      response
    );
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw createNetworkError(new Error('Failed to parse JSON response'));
  }
}

/**
 * 网络状态检测
 */
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  
  private constructor() {
    this.setupEventListeners();
  }
  
  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }
  
  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners(true);
      console.log('🌐 Network connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners(false);
      console.log('🌐 Network connection lost');
    });
  }
  
  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => listener(isOnline));
  }
  
  addListener(listener: (isOnline: boolean) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  getOnlineStatus(): boolean {
    return this.isOnline;
  }
}

/**
 * 网络错误消息映射
 */
export function getNetworkErrorMessage(error: any): string {
  if (error?.message?.includes('ERR_NETWORK_CHANGED')) {
    return '网络连接发生变化，请刷新页面重试';
  }
  
  if (error?.message?.includes('Failed to fetch')) {
    return '网络连接失败，请检查网络连接后重试';
  }
  
  if (error?.message?.includes('timeout')) {
    return '请求超时，请稍后重试';
  }
  
  if (error?.message?.includes('ERR_CONNECTION_REFUSED')) {
    return '连接被拒绝，服务器可能暂时不可用';
  }
  
  if (error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
    return '域名解析失败，请检查网络设置';
  }
  
  if (error?.status === 429) {
    return '请求过于频繁，请稍后重试';
  }
  
  if (error?.status >= 500) {
    return '服务器内部错误，请稍后重试';
  }
  
  return '网络错误，请检查连接后重试';
}
