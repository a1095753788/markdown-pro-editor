/**
 * 文档分析服务
 */

import { AIModelConfig, DocumentAnalysisResult } from '@/types/ai';
import { createAIService } from './aiService';

/**
 * 分析文档
 */
export async function analyzeDocument(
  content: string,
  modelConfig: AIModelConfig
): Promise<DocumentAnalysisResult> {
  const prompt = `请分析以下文档内容：

${content}

请按以下 JSON 格式返回分析结果：
{
  "summary": "文档的简洁总结（2-3句话）",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "suggestions": ["改进建议1", "改进建议2"],
  "readingTime": 5,
  "complexity": "easy|medium|hard"
}

其中：
- summary：用2-3句话总结文档的主要内容
- keyPoints：列出3-5个关键要点
- suggestions：给出2-3个改进建议
- readingTime：估计阅读时间（分钟）
- complexity：文档复杂度（easy简单、medium中等、hard困难）

请确保返回有效的 JSON 格式。`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '文档分析失败');
  }

  try {
    // 提取 JSON 内容
    const jsonMatch = response.data.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的分析数据');
    }

    return JSON.parse(jsonMatch[0]) as DocumentAnalysisResult;
  } catch (error) {
    console.error('解析分析数据失败:', error);
    throw new Error('解析分析数据失败');
  }
}

/**
 * 改写文档
 */
export async function rewriteDocument(
  content: string,
  style: 'formal' | 'casual' | 'academic' | 'simplified',
  modelConfig: AIModelConfig
): Promise<string> {
  const styleDescriptions = {
    formal: '正式、专业的风格',
    casual: '轻松、友好的风格',
    academic: '学术、严谨的风格',
    simplified: '简洁、易懂的风格',
  };

  const prompt = `请用${styleDescriptions[style]}改写以下文档：

${content}

改写要求：
1. 保持原意
2. 改变表达方式和语气
3. 保持内容的准确性
4. 只返回改写后的文档，不需要其他说明`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '改写失败');
  }

  return response.data;
}

/**
 * 批改文档
 */
export async function reviewDocument(
  content: string,
  modelConfig: AIModelConfig
): Promise<{
  errors: Array<{
    type: 'grammar' | 'spelling' | 'punctuation' | 'clarity' | 'logic';
    location: string;
    error: string;
    suggestion: string;
  }>;
  suggestions: string[];
  overallFeedback: string;
}> {
  const prompt = `请批改以下文档，并指出所有的语法、拼写、标点、清晰度和逻辑问题：

${content}

请按以下 JSON 格式返回批改结果：
{
  "errors": [
    {
      "type": "grammar|spelling|punctuation|clarity|logic",
      "location": "错误位置描述",
      "error": "错误内容",
      "suggestion": "改正建议"
    }
  ],
  "suggestions": ["建议1", "建议2"],
  "overallFeedback": "总体评价"
}

请确保返回有效的 JSON 格式。`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '批改失败');
  }

  try {
    // 提取 JSON 内容
    const jsonMatch = response.data.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的批改数据');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('解析批改数据失败:', error);
    throw new Error('解析批改数据失败');
  }
}

/**
 * 生成文档摘要
 */
export async function summarizeDocument(
  content: string,
  length: 'short' | 'medium' | 'long',
  modelConfig: AIModelConfig
): Promise<string> {
  const lengthDescriptions = {
    short: '50-100字',
    medium: '100-200字',
    long: '200-400字',
  };

  const prompt = `请用${lengthDescriptions[length]}的篇幅总结以下文档的主要内容：

${content}

要求：
1. 保留最重要的信息
2. 删除冗余内容
3. 保持逻辑清晰
4. 只返回摘要，不需要其他说明`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '生成摘要失败');
  }

  return response.data;
}

/**
 * 提取文档关键词
 */
export async function extractKeywords(
  content: string,
  count: number,
  modelConfig: AIModelConfig
): Promise<string[]> {
  const prompt = `请从以下文档中提取${count}个最重要的关键词：

${content}

要求：
1. 选择最能代表文档主题的词汇
2. 按重要性排序
3. 只返回关键词列表，每行一个，不需要其他说明`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '提取关键词失败');
  }

  return response.data
    .split('\n')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, count);
}

/**
 * 生成文档大纲
 */
export async function generateOutline(
  content: string,
  modelConfig: AIModelConfig
): Promise<string> {
  const prompt = `请为以下文档生成一个详细的大纲：

${content}

要求：
1. 使用分级标题（# ## ###）
2. 每个章节包含要点
3. 保持逻辑清晰
4. 只返回大纲，不需要其他说明`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '生成大纲失败');
  }

  return response.data;
}

/**
 * 扩展文档
 */
export async function expandDocument(
  content: string,
  targetLength: number,
  modelConfig: AIModelConfig
): Promise<string> {
  const prompt = `请扩展以下文档至约${targetLength}字：

${content}

要求：
1. 保持原有内容
2. 添加更多详细信息和例子
3. 保持逻辑清晰
4. 不改变主题和观点
5. 只返回扩展后的文档，不需要其他说明`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '扩展失败');
  }

  return response.data;
}
