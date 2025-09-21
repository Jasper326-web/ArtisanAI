// 前端交易管理器
export interface TransactionStatus {
  transaction_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  amount: number;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationResponse {
  success: boolean;
  image?: string;
  remaining?: number;
  error?: string;
  code?: string;
  transaction_id?: string;
  can_retry?: boolean;
  refunded?: boolean;
  new_balance?: number;
}

export class TransactionManager {
  private static instance: TransactionManager;
  private pendingTransactions: Map<string, TransactionStatus> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  // 生成图像（带重试逻辑）
  async generateImage(
    userId: string,
    prompt: string,
    images?: string[],
    model?: string,
    onProgress?: (status: 'generating' | 'retrying' | 'failed' | 'completed', data?: any) => void
  ): Promise<GenerationResponse> {
    const maxRetries = 2;
    let attempt = 0;
    let lastTransactionId: string | undefined;

    while (attempt <= maxRetries) {
      try {
        onProgress?.(attempt === 0 ? 'generating' : 'retrying', { attempt, maxRetries });

        const response = await fetch('/api/generate-robust', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            prompt,
            images,
            model,
            transaction_id: lastTransactionId // 重试时使用相同的transaction_id
          }),
        });

        const data: GenerationResponse = await response.json();

        if (response.ok && data.success) {
          // 成功生成
          onProgress?.('completed', data);
          this.clearRetryTimeout(lastTransactionId);
          return data;
        }

        // 检查错误类型
        if (data.code === 'INSUFFICIENT_CREDITS') {
          // 积分不足，不重试
          onProgress?.('failed', data);
          return data;
        }

        if (data.code === 'DUPLICATE_TRANSACTION') {
          // 重复交易，等待一下再重试
          await this.delay(1000);
          attempt++;
          continue;
        }

        if (data.code === 'MAX_RETRIES_EXCEEDED') {
          // 已达到最大重试次数
          onProgress?.('failed', data);
          return data;
        }

        if (data.can_retry && attempt < maxRetries) {
          // 可以重试
          lastTransactionId = data.transaction_id;
          this.pendingTransactions.set(lastTransactionId, {
            transaction_id: lastTransactionId,
            status: 'failed',
            amount: 50,
            retry_count: attempt,
            max_retries: maxRetries,
            error_message: data.error,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          // 延迟后重试
          await this.delay(2000 * (attempt + 1)); // 递增延迟：2s, 4s, 6s
          attempt++;
          continue;
        }

        // 其他错误或不能重试
        onProgress?.('failed', data);
        return data;

      } catch (error: any) {
        console.error(`Generation attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries) {
          // 网络错误，可以重试
          await this.delay(2000 * (attempt + 1));
          attempt++;
          continue;
        }

        // 达到最大重试次数
        onProgress?.('failed', { error: error.message });
        return {
          success: false,
          error: error.message,
          code: 'NETWORK_ERROR'
        };
      }
    }

    // 不应该到达这里
    onProgress?.('failed', { error: 'Max retries exceeded' });
    return {
      success: false,
      error: 'Max retries exceeded',
      code: 'MAX_RETRIES_EXCEEDED'
    };
  }

  // 检查交易状态
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatus | null> {
    try {
      const response = await fetch(`/api/transaction-status?transaction_id=${transactionId}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to check transaction status:', error);
      return null;
    }
  }

  // 获取用户交易历史
  async getUserTransactions(userId: string, limit: number = 20): Promise<TransactionStatus[]> {
    try {
      const response = await fetch(`/api/user-transactions?user_id=${userId}&limit=${limit}`);
      if (!response.ok) {
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      return [];
    }
  }

  // 清理过期的重试定时器
  private clearRetryTimeout(transactionId?: string) {
    if (transactionId && this.retryTimeouts.has(transactionId)) {
      clearTimeout(this.retryTimeouts.get(transactionId)!);
      this.retryTimeouts.delete(transactionId);
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清理所有待处理的交易
  cleanup() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    this.pendingTransactions.clear();
  }
}

// 导出单例实例
export const transactionManager = TransactionManager.getInstance();
