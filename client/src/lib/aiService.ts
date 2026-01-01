/**
 * AI 服务层 - 支持多个大模型的统一接口
 */

import { AIModelConfig, AIServiceResponse } from '@/types/ai';

export class AIService {
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  /**
   * 发送消息到 AI 模型
   */
  async sendMessage(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(message, systemPrompt, conversationHistory);
        case 'claude':
          return await this.callClaude(message, systemPrompt, conversationHistory);
        case 'gemini':
          return await this.callGemini(message, systemPrompt, conversationHistory);
        case 'qwen':
          return await this.callQwen(message, systemPrompt, conversationHistory);
        case 'wenxin':
          return await this.callWenxin(message, systemPrompt, conversationHistory);
        case 'xinghuo':
          return await this.callXinghuo(message, systemPrompt, conversationHistory);
        case 'ollama':
          return await this.callOllama(message, systemPrompt, conversationHistory);
        case 'custom':
          return await this.callCustom(message, systemPrompt, conversationHistory);
        default:
          return {
            success: false,
            error: '不支持的模型提供商',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  /**
   * OpenAI API 调用
   */
  private async callOpenAI(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'API 调用失败',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  /**
   * Claude API 调用
   */
  private async callClaude(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    const messages: Array<{ role: string; content: string }> = [];

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.modelName,
        max_tokens: this.config.maxTokens || 2000,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'API 调用失败',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  /**
   * Google Gemini API 调用
   */
  private async callGemini(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (conversationHistory) {
      contents.push(
        ...conversationHistory.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))
      );
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.modelName}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: systemPrompt
            ? {
                parts: [{ text: systemPrompt }],
              }
            : undefined,
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            maxOutputTokens: this.config.maxTokens || 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'API 调用失败',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.candidates[0].content.parts[0].text,
    };
  }

  /**
   * 阿里通义千问 API 调用
   */
  private async callQwen(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages,
          parameters: {
            temperature: this.config.temperature || 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'API 调用失败',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.output.text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
    };
  }

  /**
   * 百度文心一言 API 调用
   */
  private async callWenxin(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    // 百度文心需要先获取 access_token
    // 这里简化处理，实际使用需要完整的认证流程
    return {
      success: false,
      error: '百度文心一言需要特殊的认证流程，请使用其他模型',
    };
  }

  /**
   * 讯飞星火 API 调用
   */
  private async callXinghuo(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    // 讯飞星火需要特殊的认证和签名
    // 这里简化处理
    return {
      success: false,
      error: '讯飞星火需要特殊的认证流程，请使用其他模型',
    };
  }

  /**
   * Ollama 本地模型调用
   */
  private async callOllama(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch(`${this.config.apiUrl || 'http://localhost:11434/api'}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'Ollama 连接失败，请确保本地模型服务正在运行',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.message.content,
    };
  }

  /**
   * 自定义 API 调用
   */
  private async callCustom(
    message: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<AIServiceResponse<string>> {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    if (conversationHistory) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch(this.config.apiUrl || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.modelName,
        messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || 'API 调用失败',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.choices?.[0]?.message?.content || data.message?.content || JSON.stringify(data),
    };
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<AIServiceResponse<boolean>> {
    try {
      const result = await this.sendMessage('你好，请回复"连接成功"');
      return {
        success: result.success,
        data: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : '连接失败',
      };
    }
  }
}

/**
 * 创建 AI 服务实例
 */
export function createAIService(config: AIModelConfig): AIService {
  return new AIService(config);
}
