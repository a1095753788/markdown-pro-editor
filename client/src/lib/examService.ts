/**
 * 试卷生成和批改服务
 */

import {
  AIModelConfig,
  ExamGenerationRequest,
  GeneratedExam,
  ExamQuestion,
  ExamGradingResult,
  QuestionGradingResult,
} from '@/types/ai';
import { createAIService } from './aiService';

/**
 * 根据内容生成试卷
 */
export async function generateExam(
  request: ExamGenerationRequest,
  modelConfig: AIModelConfig
): Promise<GeneratedExam> {
  const prompt = `根据以下内容生成${request.questionCount}道${request.subject}试题。

内容：
${request.content}

要求：
- 题型：${request.questionTypes.join('、')}
- 难度：${request.difficulty}
- 年级：${request.grade === 'junior' ? '初中' : '高中'}
- 每题应包含标准答案和详细解析

请按以下 JSON 格式返回结果：
{
  "title": "试卷标题",
  "questions": [
    {
      "id": "q1",
      "type": "single-choice|multiple-choice|fill-blank|short-answer|essay",
      "content": "题目内容",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "答案",
      "score": 5,
      "explanation": "解析",
      "difficulty": "easy|medium|hard"
    }
  ],
  "totalScore": 100,
  "estimatedTime": 120
}

请确保返回有效的 JSON 格式。`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '试卷生成失败');
  }

  try {
    // 提取 JSON 内容
    const jsonMatch = response.data.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的试卷数据');
    }

    const exam = JSON.parse(jsonMatch[0]) as GeneratedExam;
    return exam;
  } catch (error) {
    console.error('解析试卷数据失败:', error);
    throw new Error('解析试卷数据失败');
  }
}

/**
 * 批改试卷
 */
export async function gradeExam(
  questions: ExamQuestion[],
  studentAnswers: Record<string, string>,
  modelConfig: AIModelConfig
): Promise<ExamGradingResult> {
  const prompt = `请根据以下题目和学生答案进行批改。

${questions
  .map(
    (q, index) => `
题目 ${index + 1}：${q.content}
${q.options ? `选项：${q.options.join('、')}` : ''}
标准答案：${Array.isArray(q.answer) ? q.answer.join('、') : q.answer}
学生答案：${studentAnswers[q.id] || '未作答'}
满分：${q.score}分
`
  )
  .join('\n')}

请按以下 JSON 格式返回批改结果：
{
  "totalScore": 85,
  "maxScore": 100,
  "percentage": 85,
  "feedback": "总体评价",
  "questionResults": [
    {
      "questionId": "q1",
      "score": 5,
      "maxScore": 5,
      "feedback": "回答正确",
      "isCorrect": true
    }
  ]
}

请确保返回有效的 JSON 格式，并给出公平公正的评分。`;

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

    const result = JSON.parse(jsonMatch[0]) as ExamGradingResult;
    return result;
  } catch (error) {
    console.error('解析批改数据失败:', error);
    throw new Error('解析批改数据失败');
  }
}

/**
 * 分析试卷难度
 */
export async function analyzeExamDifficulty(
  exam: GeneratedExam,
  modelConfig: AIModelConfig
): Promise<{
  overallDifficulty: 'easy' | 'medium' | 'hard';
  analysis: string;
  suggestions: string[];
}> {
  const prompt = `请分析以下试卷的难度分布和合理性。

试卷标题：${exam.title}
总分：${exam.totalScore}分
预计时间：${exam.estimatedTime}分钟

题目列表：
${exam.questions
  .map(
    (q, index) => `
${index + 1}. ${q.content}
   难度：${q.difficulty}
   分值：${q.score}分
`
  )
  .join('\n')}

请分析：
1. 试卷的总体难度
2. 难度分布是否合理
3. 分值分配是否合理
4. 改进建议

请按以下 JSON 格式返回结果：
{
  "overallDifficulty": "easy|medium|hard",
  "analysis": "详细分析",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '分析失败');
  }

  try {
    // 提取 JSON 内容
    const jsonMatch = response.data.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('无法解析 AI 返回的分析数据');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('解析分析数据失败:', error);
    throw new Error('解析分析数据失败');
  }
}

/**
 * 生成学习建议
 */
export async function generateLearningAdvice(
  gradingResult: ExamGradingResult,
  subject: string,
  modelConfig: AIModelConfig
): Promise<string> {
  const wrongQuestions = gradingResult.questionResults.filter((q) => !q.isCorrect);

  const prompt = `学生在${subject}考试中得分${gradingResult.totalScore}/${gradingResult.maxScore}（${gradingResult.percentage}%）。

答错的题目：
${wrongQuestions
  .map(
    (q, index) => `
${index + 1}. 题目 ${q.questionId}
   得分：${q.score}/${q.maxScore}
   反馈：${q.feedback}
`
  )
  .join('\n')}

总体评价：${gradingResult.feedback}

请根据学生的答题情况，提供针对性的学习建议和改进方向。`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '生成建议失败');
  }

  return response.data;
}

/**
 * 生成试卷分析报告
 */
export async function generateExamReport(
  exam: GeneratedExam,
  gradingResults: ExamGradingResult[],
  modelConfig: AIModelConfig
): Promise<string> {
  const averageScore = gradingResults.reduce((sum, r) => sum + r.totalScore, 0) / gradingResults.length;
  const passRate = (gradingResults.filter((r) => r.percentage >= 60).length / gradingResults.length) * 100;

  const prompt = `请根据以下试卷和批改数据生成一份教学分析报告。

试卷信息：
- 标题：${exam.title}
- 总分：${exam.totalScore}分
- 题目数：${exam.questions.length}道

批改统计：
- 学生数：${gradingResults.length}
- 平均分：${averageScore.toFixed(2)}分
- 及格率：${passRate.toFixed(1)}%
- 最高分：${Math.max(...gradingResults.map((r) => r.totalScore))}分
- 最低分：${Math.min(...gradingResults.map((r) => r.totalScore))}分

请生成包含以下内容的分析报告：
1. 学生整体表现评价
2. 高频错题分析
3. 教学改进建议
4. 后续教学计划`;

  const aiService = createAIService(modelConfig);
  const response = await aiService.sendMessage(prompt);

  if (!response.success || !response.data) {
    throw new Error(response.error || '生成报告失败');
  }

  return response.data;
}
