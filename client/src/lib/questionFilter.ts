/**
 * 试题筛选和出卷服务
 * 从文档中提取试题，支持筛选和组合
 */

export interface Question {
  id: string;
  content: string;
  type: 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer' | 'essay';
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  score: number;
  options?: string[];
  answer?: string | string[];
  source: string; // 来源文件
}

export interface FilterCriteria {
  types?: string[];
  difficulties?: string[];
  subjects?: string[];
  scoreRange?: [number, number];
  keywords?: string[];
}

/**
 * 从 Markdown 文档中提取试题
 */
export function extractQuestionsFromMarkdown(content: string, sourceFile: string): Question[] {
  const questions: Question[] = [];
  let questionId = 0;

  // 匹配标准试题格式
  // 格式: ## 题目 1 (单选/多选/填空/简答/论述)
  // 难度: 简单/中等/困难
  // 分值: 5分
  // 科目: 数学
  // 选项: A. ... B. ... C. ... D. ...
  // 答案: A

  const questionPattern = /##\s*题目\s*(\d+)\s*\(([^)]+)\)[\s\S]*?(?=##\s*题目|$)/g;
  let match;

  while ((match = questionPattern.exec(content)) !== null) {
    const questionBlock = match[0];
    const questionNum = match[1];
    const questionType = match[2];

    // 提取内容
    const contentMatch = questionBlock.match(/\n([\s\S]*?)(?:\n难度:|$)/);
    const content_text = contentMatch ? contentMatch[1].trim() : '';

    // 提取难度
    const difficultyMatch = questionBlock.match(/难度:\s*(简单|中等|困难|easy|medium|hard)/);
    const difficulty = difficultyMatch
      ? difficultyMatch[1] === '简单' || difficultyMatch[1] === 'easy'
        ? 'easy'
        : difficultyMatch[1] === '中等' || difficultyMatch[1] === 'medium'
        ? 'medium'
        : 'hard'
      : 'medium';

    // 提取分值
    const scoreMatch = questionBlock.match(/分值:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

    // 提取科目
    const subjectMatch = questionBlock.match(/科目:\s*([^\n]+)/);
    const subject = subjectMatch ? subjectMatch[1].trim() : '通用';

    // 提取选项
    const options: string[] = [];
    const optionPattern = /[A-D]\.\s*([^\n]+)/g;
    let optionMatch;
    while ((optionMatch = optionPattern.exec(questionBlock)) !== null) {
      options.push(optionMatch[1].trim());
    }

    // 提取答案
    const answerMatch = questionBlock.match(/答案:\s*([^\n]+)/);
    const answer = answerMatch ? answerMatch[1].trim() : '';

    questions.push({
      id: `q-${sourceFile}-${questionId++}`,
      content: content_text,
      type: mapQuestionType(questionType),
      difficulty,
      subject,
      score,
      options: options.length > 0 ? options : undefined,
      answer: answer || undefined,
      source: sourceFile,
    });
  }

  // 如果没有找到标准格式，尝试提取段落作为试题
  if (questions.length === 0) {
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
    paragraphs.forEach((para, index) => {
      if (para.length > 10) {
        questions.push({
          id: `q-${sourceFile}-${index}`,
          content: para.trim(),
          type: 'short-answer',
          difficulty: 'medium',
          subject: '通用',
          score: 5,
          source: sourceFile,
        });
      }
    });
  }

  return questions;
}

/**
 * 从多个文档中提取试题
 */
export function extractQuestionsFromMultipleFiles(
  files: Array<{ name: string; content: string }>
): Question[] {
  const allQuestions: Question[] = [];

  files.forEach((file) => {
    const questions = extractQuestionsFromMarkdown(file.content, file.name);
    allQuestions.push(...questions);
  });

  return allQuestions;
}

/**
 * 筛选试题
 */
export function filterQuestions(questions: Question[], criteria: FilterCriteria): Question[] {
  return questions.filter((q) => {
    // 类型筛选
    if (criteria.types && criteria.types.length > 0) {
      if (!criteria.types.includes(q.type)) {
        return false;
      }
    }

    // 难度筛选
    if (criteria.difficulties && criteria.difficulties.length > 0) {
      if (!criteria.difficulties.includes(q.difficulty)) {
        return false;
      }
    }

    // 科目筛选
    if (criteria.subjects && criteria.subjects.length > 0) {
      if (!criteria.subjects.includes(q.subject)) {
        return false;
      }
    }

    // 分值范围筛选
    if (criteria.scoreRange) {
      const [min, max] = criteria.scoreRange;
      if (q.score < min || q.score > max) {
        return false;
      }
    }

    // 关键词筛选
    if (criteria.keywords && criteria.keywords.length > 0) {
      const hasKeyword = criteria.keywords.some((keyword) =>
        q.content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 按难度分布出卷
 */
export function generateExamByDifficulty(
  questions: Question[],
  totalScore: number,
  distribution: { easy: number; medium: number; hard: number }
): Question[] {
  const easyQuestions = questions.filter((q) => q.difficulty === 'easy');
  const mediumQuestions = questions.filter((q) => q.difficulty === 'medium');
  const hardQuestions = questions.filter((q) => q.difficulty === 'hard');

  const selectedQuestions: Question[] = [];
  let currentScore = 0;

  // 计算每个难度级别应该的分值
  const totalParts = distribution.easy + distribution.medium + distribution.hard;
  const easyScore = Math.round((totalScore * distribution.easy) / totalParts);
  const mediumScore = Math.round((totalScore * distribution.medium) / totalParts);
  const hardScore = totalScore - easyScore - mediumScore;

  // 选择简单题
  selectedQuestions.push(...selectQuestionsByScore(easyQuestions, easyScore));

  // 选择中等题
  selectedQuestions.push(...selectQuestionsByScore(mediumQuestions, mediumScore));

  // 选择困难题
  selectedQuestions.push(...selectQuestionsByScore(hardQuestions, hardScore));

  return selectedQuestions;
}

/**
 * 按分值选择试题
 */
export function selectQuestionsByScore(questions: Question[], targetScore: number): Question[] {
  const selected: Question[] = [];
  let currentScore = 0;

  // 先选择分值接近的题目
  const sortedQuestions = [...questions].sort((a, b) => {
    const aDiff = Math.abs(a.score - (targetScore - currentScore));
    const bDiff = Math.abs(b.score - (targetScore - currentScore));
    return aDiff - bDiff;
  });

  for (const question of sortedQuestions) {
    if (currentScore + question.score <= targetScore) {
      selected.push(question);
      currentScore += question.score;
    }

    if (currentScore >= targetScore) {
      break;
    }
  }

  return selected;
}

/**
 * 随机选择试题
 */
export function selectQuestionsRandomly(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 按比例选择试题
 */
export function selectQuestionsByRatio(
  questions: Question[],
  totalScore: number,
  typeRatios: Record<string, number>
): Question[] {
  const selected: Question[] = [];

  Object.entries(typeRatios).forEach(([type, ratio]) => {
    const typeQuestions = questions.filter((q) => q.type === type);
    const typeScore = Math.round(totalScore * ratio);
    const typeSelected = selectQuestionsByScore(typeQuestions, typeScore);
    selected.push(...typeSelected);
  });

  return selected;
}

/**
 * 获取试题统计信息
 */
export function getQuestionStats(questions: Question[]): {
  total: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  bySubject: Record<string, number>;
  totalScore: number;
  avgScore: number;
} {
  const stats = {
    total: questions.length,
    byType: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    bySubject: {} as Record<string, number>,
    totalScore: 0,
    avgScore: 0,
  };

  questions.forEach((q) => {
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
    stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
    stats.totalScore += q.score;
  });

  stats.avgScore = questions.length > 0 ? stats.totalScore / questions.length : 0;

  return stats;
}

/**
 * 将试题导出为 Markdown
 */
export function exportQuestionsAsMarkdown(questions: Question[]): string {
  let markdown = '# 试题库\n\n';

  questions.forEach((q, index) => {
    markdown += `## 题目 ${index + 1} (${q.type})\n\n`;
    markdown += `${q.content}\n\n`;

    if (q.options && q.options.length > 0) {
      markdown += '选项:\n';
      q.options.forEach((opt, i) => {
        markdown += `${String.fromCharCode(65 + i)}. ${opt}\n`;
      });
      markdown += '\n';
    }

    markdown += `难度: ${q.difficulty}\n`;
    markdown += `分值: ${q.score}分\n`;
    markdown += `科目: ${q.subject}\n`;

    if (q.answer) {
      markdown += `答案: ${q.answer}\n`;
    }

    markdown += '\n---\n\n';
  });

  return markdown;
}

/**
 * 将试题导出为 JSON
 */
export function exportQuestionsAsJSON(questions: Question[]): string {
  return JSON.stringify(questions, null, 2);
}

/**
 * 映射试题类型
 */
function mapQuestionType(
  typeStr: string
): 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer' | 'essay' {
  const normalized = typeStr.toLowerCase();

  if (normalized.includes('单选')) return 'single-choice';
  if (normalized.includes('多选')) return 'multiple-choice';
  if (normalized.includes('填空')) return 'fill-blank';
  if (normalized.includes('简答')) return 'short-answer';
  if (normalized.includes('论述')) return 'essay';

  return 'short-answer';
}
