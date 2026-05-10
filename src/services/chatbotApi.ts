import apiClient from './apiClient';
import type { ApiResponse } from '../types';

interface ChatRequest {
  message: string;
  context?: string;
}

interface ChatResponse {
  reply: string;
  status: string;
}

export const chatbotApi = {
  /**
   * Gửi tin nhắn tới chatbot AI
   * POST /api/chat
   */
  sendMessage: (data: ChatRequest) =>
    apiClient.post<ApiResponse<ChatResponse>>('/api/chat', data),

  /**
   * Gửi tin nhắn tới chatbot AI (alternative endpoint)
   * POST /api/v1/ai-chat
   */
  sendMessageV1: (data: ChatRequest) =>
    apiClient.post<ApiResponse<ChatResponse>>('/api/v1/ai-chat', data),
};
