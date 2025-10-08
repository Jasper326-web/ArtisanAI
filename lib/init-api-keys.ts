// 初始化 API Key 管理器
import { initializeAPIKeyManager } from './api-key-manager';

// 你的 API Keys
const API_KEYS = [
  'AIzaSyA5IHgEV-ZIbxW1UnZY0qQ8AuWi6O5tns0',
  'AIzaSyBNxPQvdOeVWyB7V-BD0YKRvLHYXsB_sSI', 
  'AIzaSyD9UQzUGEyGkLS1-SSPPTDiPrDtNjkJBkY',
  'AIzaSyBPPeLRP-QaKWPmQyXJgcP1vxJjiyV62Bw',
  'AIzaSyDrb9uTXStlHiKd1NDh7X575k5tzawATcw',
  'AIzaSyA2HKAm-HXLzNuaoKsOggd_tMmmifU7ZhY'
];

// 初始化 API Key 管理器
export function initAPIKeys() {
  try {
    initializeAPIKeyManager(API_KEYS);
    console.log('✅ API Key 管理器初始化成功');
    console.log(`🔑 已配置 ${API_KEYS.length} 个 API Key`);
    return true;
  } catch (error) {
    console.error('❌ API Key 管理器初始化失败:', error);
    return false;
  }
}

// 导出 API Keys 供其他模块使用
export { API_KEYS };
