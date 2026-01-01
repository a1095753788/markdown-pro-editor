/**
 * 图片识别和 OCR 服务
 * 支持使用 AI 模型进行图片分析
 */

import { AIModelConfig, ImageRecognitionResult, Formula } from '@/types/ai';
import { createAIService } from './aiService';

/**
 * 将图片转换为 Base64
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // 移除 data:image/... 前缀
    };
    reader.onerror = reject;
  });
}

/**
 * 使用 AI 模型识别图片中的文本和公式
 */
export async function recognizeImageWithAI(
  imageBase64: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<ImageRecognitionResult> {
  try {
    // 构建包含图片的消息
    const message = `请识别这张图片中的所有文本和数学公式。
    
请按以下格式返回结果：
1. 首先列出识别到的所有文本内容
2. 然后列出所有数学公式（使用 LaTeX 格式）
3. 最后给出识别的置信度（0-100）

格式示例：
[TEXT]
识别到的文本内容...

[FORMULAS]
$公式1$
$公式2$

[CONFIDENCE]
95`;

    const aiService = createAIService(modelConfig);

    // 对于支持图片的模型，使用特殊处理
    if (modelConfig.provider === 'openai' || modelConfig.provider === 'claude' || modelConfig.provider === 'gemini') {
      const result = await recognizeWithVisionAPI(
        imageBase64,
        message,
        modelConfig,
        imageType
      );
      return result;
    } else {
      // 对于不支持图片的模型，返回错误
      return {
        text: '',
        formulas: [],
        confidence: 0,
        language: 'unknown',
      };
    }
  } catch (error) {
    console.error('图片识别失败:', error);
    return {
      text: '',
      formulas: [],
      confidence: 0,
      language: 'unknown',
    };
  }
}

/**
 * 使用 Vision API 识别图片
 */
async function recognizeWithVisionAPI(
  imageBase64: string,
  prompt: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp'
): Promise<ImageRecognitionResult> {
  try {
    if (modelConfig.provider === 'openai') {
      return await recognizeWithOpenAIVision(imageBase64, prompt, modelConfig, imageType);
    } else if (modelConfig.provider === 'claude') {
      return await recognizeWithClaudeVision(imageBase64, prompt, modelConfig, imageType);
    } else if (modelConfig.provider === 'gemini') {
      return await recognizeWithGeminiVision(imageBase64, prompt, modelConfig, imageType);
    }

    return {
      text: '',
      formulas: [],
      confidence: 0,
      language: 'unknown',
    };
  } catch (error) {
    console.error('Vision API 调用失败:', error);
    return {
      text: '',
      formulas: [],
      confidence: 0,
      language: 'unknown',
    };
  }
}

/**
 * OpenAI Vision API
 */
async function recognizeWithOpenAIVision(
  imageBase64: string,
  prompt: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp'
): Promise<ImageRecognitionResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${modelConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: modelConfig.modelName,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/${imageType};base64,${imageBase64}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI Vision API 调用失败');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  return parseRecognitionResult(content);
}

/**
 * Claude Vision API
 */
async function recognizeWithClaudeVision(
  imageBase64: string,
  prompt: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp'
): Promise<ImageRecognitionResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': modelConfig.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelConfig.modelName,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: `image/${imageType}`,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Claude Vision API 调用失败');
  }

  const data = await response.json();
  const content = data.content[0].text;

  return parseRecognitionResult(content);
}

/**
 * Google Gemini Vision API
 */
async function recognizeWithGeminiVision(
  imageBase64: string,
  prompt: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp'
): Promise<ImageRecognitionResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.modelName}:generateContent?key=${modelConfig.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: `image/${imageType}`,
                  data: imageBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Gemini Vision API 调用失败');
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  return parseRecognitionResult(content);
}

/**
 * 解析识别结果
 */
function parseRecognitionResult(content: string): ImageRecognitionResult {
  const textMatch = content.match(/\[TEXT\]([\s\S]*?)(?=\[FORMULAS\]|\[CONFIDENCE\]|$)/);
  const formulasMatch = content.match(/\[FORMULAS\]([\s\S]*?)(?=\[CONFIDENCE\]|$)/);
  const confidenceMatch = content.match(/\[CONFIDENCE\]\s*(\d+)/);

  const text = textMatch ? textMatch[1].trim() : content;
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 80;

  let formulas: Formula[] = [];
  if (formulasMatch) {
    const formulasText = formulasMatch[1].trim();
    const formulaLines = formulasText.split('\n').filter((line) => line.includes('$'));
    formulas = formulaLines.map((line, index) => ({
      latex: line.replace(/\$/g, '').trim(),
      position: {
        x: 0,
        y: index * 30,
        width: 100,
        height: 30,
      },
    }));
  }

  return {
    text,
    formulas,
    confidence,
    language: detectLanguage(text),
  };
}

/**
 * 检测文本语言
 */
function detectLanguage(text: string): string {
  const chineseRegex = /[\u4E00-\u9FFF]/g;
  const englishRegex = /[a-zA-Z]/g;

  const chineseMatches = text.match(chineseRegex) || [];
  const englishMatches = text.match(englishRegex) || [];

  if (chineseMatches.length > englishMatches.length) {
    return 'zh';
  } else if (englishMatches.length > 0) {
    return 'en';
  }

  return 'unknown';
}

/**
 * 提取图片中的公式
 */
export async function extractFormulasFromImage(
  imageBase64: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<Formula[]> {
  const prompt = `请识别这张图片中的所有数学公式，并用 LaTeX 格式表示。
  
只返回公式列表，每行一个公式，格式如下：
$公式1$
$公式2$
...`;

  const result = await recognizeImageWithAI(imageBase64, modelConfig, imageType);
  return result.formulas;
}

/**
 * 从图片中提取文本
 */
export async function extractTextFromImage(
  imageBase64: string,
  modelConfig: AIModelConfig,
  imageType: 'jpeg' | 'png' | 'webp' = 'jpeg'
): Promise<string> {
  const prompt = `请识别这张图片中的所有文本内容。只返回识别到的文本，不需要其他说明。`;

  const result = await recognizeImageWithAI(imageBase64, modelConfig, imageType);
  return result.text;
}
