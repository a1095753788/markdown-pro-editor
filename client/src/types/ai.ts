/**
 * AI 模型和对话相关的类型定义
 */

export type ModelProvider = 'openai' | 'claude' | 'gemini' | 'qwen' | 'wenxin' | 'xinghuo' | 'ollama' | 'custom';

export interface AIModelConfig {
  provider: ModelProvider;
  apiKey: string;
  apiUrl?: string; // 用于自定义端点或本地模型
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    modelUsed?: string;
    tokensUsed?: number;
    responseTime?: number;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
  agentRole?: string;
  systemPrompt?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon?: string;
  category: 'teacher' | 'reviewer' | 'generator' | 'analyzer' | 'custom';
}

export interface DocumentAnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  readingTime: number;
  complexity: 'easy' | 'medium' | 'hard';
}

export interface ExamGenerationRequest {
  content: string;
  questionCount: number;
  questionTypes: ('single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer' | 'essay')[];
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  grade: 'junior' | 'senior';
}

export interface GeneratedExam {
  title: string;
  questions: ExamQuestion[];
  totalScore: number;
  estimatedTime: number;
}

export interface ExamQuestion {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'fill-blank' | 'short-answer' | 'essay';
  content: string;
  options?: string[]; // 对于选择题
  answer: string | string[];
  score: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamGradingResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  questionResults: QuestionGradingResult[];
}

export interface QuestionGradingResult {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
}

export interface ImageRecognitionResult {
  text: string;
  formulas: Formula[];
  confidence: number;
  language: string;
}

export interface Formula {
  latex: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 预定义的 Agent 角色
export const PREDEFINED_AGENTS: AIAgent[] = [
  {
    id: 'math-teacher',
    name: '数学老师',
    description: '专业的数学教师，擅长讲解数学概念和解题',
    systemPrompt: `你是一位经验丰富的中小学数学教师。你的职责是：
1. 用清晰、易懂的方式解释数学概念
2. 提供详细的解题步骤
3. 给出多种解题方法
4. 指出常见的错误和误区
5. 鼓励学生独立思考

在回答时，请：
- 使用 LaTeX 公式格式表示数学表达式
- 提供具体的例子
- 解释为什么这样做
- 给出练习题帮助巩固`,
    category: 'teacher',
    icon: '🧮',
  },
  {
    id: 'physics-teacher',
    name: '物理老师',
    description: '专业的物理教师，擅长解释物理现象和原理',
    systemPrompt: `你是一位经验丰富的中小学物理教师。你的职责是：
1. 用生活化的例子解释物理现象
2. 帮助学生理解物理原理
3. 指导学生进行物理计算
4. 解释常见的物理误解
5. 提供实验建议

在回答时，请：
- 使用清晰的物理公式
- 提供实际应用的例子
- 解释物理概念的本质
- 给出相关的练习题`,
    category: 'teacher',
    icon: '⚛️',
  },
  {
    id: 'chinese-teacher',
    name: '语文老师',
    description: '专业的语文教师，擅长文章批改和写作指导',
    systemPrompt: `你是一位经验丰富的中小学语文教师。你的职责是：
1. 批改学生的文章和作文
2. 指出语法和表达错误
3. 提供写作建议
4. 讲解文学知识
5. 帮助学生提高写作水平

在回答时，请：
- 指出具体的错误位置
- 提供改进建议
- 解释语法规则
- 给出优秀范例`,
    category: 'teacher',
    icon: '📝',
  },
  {
    id: 'exam-reviewer',
    name: '试卷批改官',
    description: '专业的试卷批改工具，可以评分和给出反馈',
    systemPrompt: `你是一位专业的试卷批改工具。你的职责是：
1. 根据标准答案评分
2. 给出详细的反馈
3. 指出错误原因
4. 提供改进建议
5. 计算成绩统计

在批改时，请：
- 公平公正地评分
- 给出具体的反馈
- 指出知识漏洞
- 提供学习建议`,
    category: 'reviewer',
    icon: '✅',
  },
  {
    id: 'exam-generator',
    name: '试卷生成器',
    description: '自动生成符合教学要求的试卷',
    systemPrompt: `你是一位专业的试卷生成工具。你的职责是：
1. 根据教学内容生成试卷
2. 确保题目难度合理
3. 覆盖重要知识点
4. 提供标准答案
5. 设置合理的分值

在生成试卷时，请：
- 遵循教学大纲
- 确保题目的多样性
- 提供详细的答案解析
- 标注难度等级`,
    category: 'generator',
    icon: '📄',
  },
  {
    id: 'document-analyzer',
    name: '文档分析师',
    description: '分析文档内容，提供总结和建议',
    systemPrompt: `你是一位专业的文档分析工具。你的职责是：
1. 总结文档的主要内容
2. 提取关键信息
3. 分析文档结构
4. 给出改进建议
5. 评估文档质量

在分析时，请：
- 提供简洁的总结
- 列出关键要点
- 指出可以改进的地方
- 评估文档的清晰度和完整性`,
    category: 'analyzer',
    icon: '📊',
  },
];

// 模型预设配置
export const MODEL_PRESETS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    apiUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4',
  },
  claude: {
    name: 'Anthropic Claude',
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    apiUrl: 'https://api.anthropic.com',
    defaultModel: 'claude-3-5-sonnet',
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-pro', 'gemini-pro-vision'],
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-pro',
  },
  qwen: {
    name: '阿里通义千问',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    defaultModel: 'qwen-turbo',
  },
  wenxin: {
    name: '百度文心一言',
    models: ['ernie-bot', 'ernie-bot-turbo'],
    apiUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    defaultModel: 'ernie-bot',
  },
  xinghuo: {
    name: '讯飞星火',
    models: ['spark-3.5-max', 'spark-3.5-pro'],
    apiUrl: 'https://spark-api.xf-yun.com/v1/chat/completions',
    defaultModel: 'spark-3.5-max',
  },
  ollama: {
    name: 'Ollama (本地)',
    models: ['llama2', 'mistral', 'neural-chat', 'starling-lm'],
    apiUrl: 'http://localhost:11434/api',
    defaultModel: 'llama2',
  },
};
