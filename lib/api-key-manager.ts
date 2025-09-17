// API Key 轮换管理器
export class APIKeyManager {
  private apiKeys: string[];
  private currentIndex: number;
  private failedKeys: Set<number>;

  constructor(apiKeys: string[]) {
    this.apiKeys = apiKeys.filter(key => key && key.trim() !== '');
    this.currentIndex = 0;
    this.failedKeys = new Set();
    
    if (this.apiKeys.length === 0) {
      throw new Error('至少需要一个有效的 API Key');
    }
    
    console.log(`🔑 API Key 管理器初始化：${this.apiKeys.length} 个 Key 可用`);
  }

  // 获取当前可用的 API Key
  getCurrentKey(): string {
    const availableKeys = this.getAvailableKeys();
    if (availableKeys.length === 0) {
      throw new Error('所有 API Key 都已失效，请检查配额或添加新的 Key');
    }
    
    const key = availableKeys[this.currentIndex % availableKeys.length];
    console.log(`🔑 使用 API Key ${this.currentIndex + 1}/${this.apiKeys.length}`);
    return key;
  }

  // 获取所有可用的 API Key
  getAvailableKeys(): string[] {
    return this.apiKeys.filter((_, index) => !this.failedKeys.has(index));
  }

  // 标记当前 Key 为失败
  markCurrentKeyFailed(): void {
    this.failedKeys.add(this.currentIndex);
    console.log(`❌ API Key ${this.currentIndex + 1} 标记为失败`);
    
    // 切换到下一个可用的 Key
    this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
    
    // 如果所有 Key 都失败了，重置失败标记（给它们一个重试的机会）
    if (this.failedKeys.size === this.apiKeys.length) {
      console.log('🔄 所有 API Key 都失败了，重置失败标记');
      this.failedKeys.clear();
    }
  }

  // 获取状态信息
  getStatus(): {
    totalKeys: number;
    availableKeys: number;
    failedKeys: number;
    currentKeyIndex: number;
  } {
    return {
      totalKeys: this.apiKeys.length,
      availableKeys: this.getAvailableKeys().length,
      failedKeys: this.failedKeys.size,
      currentKeyIndex: this.currentIndex
    };
  }

  // 添加新的 API Key
  addApiKey(apiKey: string): void {
    if (apiKey && apiKey.trim() !== '') {
      this.apiKeys.push(apiKey.trim());
      console.log(`✅ 添加新的 API Key，总数：${this.apiKeys.length}`);
    }
  }

  // 移除 API Key
  removeApiKey(index: number): void {
    if (index >= 0 && index < this.apiKeys.length) {
      this.apiKeys.splice(index, 1);
      this.failedKeys.delete(index);
      console.log(`🗑️ 移除 API Key ${index + 1}，剩余：${this.apiKeys.length}`);
    }
  }
}

// 创建全局实例
let apiKeyManager: APIKeyManager | null = null;

export function initializeAPIKeyManager(apiKeys: string[]): void {
  apiKeyManager = new APIKeyManager(apiKeys);
}

export function getAPIKeyManager(): APIKeyManager {
  if (!apiKeyManager) {
    throw new Error('API Key 管理器未初始化，请先调用 initializeAPIKeyManager');
  }
  return apiKeyManager;
}
