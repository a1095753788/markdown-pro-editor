/**
 * 文件夹题库管理
 * 支持从文件夹中导入多个文件作为题库
 */

export interface QuestionBankFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
  questions?: QuestionBankQuestion[];
}

export interface QuestionBankQuestion {
  id: string;
  fileId: string;
  title: string;
  content: string;
  type?: string; // single-choice, multiple-choice, fill-blank, short-answer
  difficulty?: string; // easy, medium, hard
  score?: number;
  selected?: boolean;
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  files: QuestionBankFile[];
  totalQuestions: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 题库管理类
 */
export class QuestionBankManager {
  private static readonly STORAGE_KEY = 'markdown-editor-question-banks';
  private static readonly FILES_KEY = 'markdown-editor-bank-files';

  /**
   * 创建新题库
   */
  static createBank(name: string, description?: string): QuestionBank {
    const bank: QuestionBank = {
      id: `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      files: [],
      totalQuestions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveBank(bank);
    return bank;
  }

  /**
   * 保存题库
   */
  private static saveBank(bank: QuestionBank): void {
    const banks = this.getAllBanks();
    const index = banks.findIndex((b) => b.id === bank.id);

    if (index >= 0) {
      banks[index] = bank;
    } else {
      banks.push(bank);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(banks));
  }

  /**
   * 获取所有题库
   */
  static getAllBanks(): QuestionBank[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 获取单个题库
   */
  static getBank(id: string): QuestionBank | undefined {
    return this.getAllBanks().find((b) => b.id === id);
  }

  /**
   * 删除题库
   */
  static deleteBank(id: string): void {
    const banks = this.getAllBanks();
    const filtered = banks.filter((b) => b.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * 添加文件到题库
   */
  static addFileToBank(bankId: string, file: QuestionBankFile): void {
    const bank = this.getBank(bankId);
    if (!bank) return;

    // 检查是否已存在
    const existingIndex = bank.files.findIndex((f) => f.id === file.id);
    if (existingIndex >= 0) {
      bank.files[existingIndex] = file;
    } else {
      bank.files.push(file);
    }

    // 提取问题
    file.questions = this.extractQuestionsFromFile(file);
    bank.totalQuestions = bank.files.reduce((sum, f) => sum + (f.questions?.length || 0), 0);
    bank.updatedAt = new Date();

    this.saveBank(bank);
  }

  /**
   * 从文件中提取问题
   */
  private static extractQuestionsFromFile(file: QuestionBankFile): QuestionBankQuestion[] {
    const questions: QuestionBankQuestion[] = [];
    const lines = file.content.split('\n');

    let currentQuestion: Partial<QuestionBankQuestion> | null = null;
    let contentBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测新问题（## 或 ### 开头）
      if (line.match(/^#{2,3}\s+/)) {
        // 保存前一个问题
        if (currentQuestion) {
          currentQuestion.content = contentBuffer.join('\n').trim();
          questions.push({
            id: `q-${file.id}-${questions.length}`,
            fileId: file.id,
            title: currentQuestion.title || '',
            content: currentQuestion.content || '',
            type: currentQuestion.type,
            difficulty: currentQuestion.difficulty,
            score: currentQuestion.score,
          });
        }

        // 开始新问题
        const title = line.replace(/^#{2,3}\s+/, '');
        currentQuestion = {
          title,
          type: this.detectQuestionType(title),
          difficulty: this.detectDifficulty(title),
          score: this.detectScore(title),
        };
        contentBuffer = [];
      }
      // 检测元数据
      else if (line.startsWith('难度:') || line.startsWith('Difficulty:')) {
        if (currentQuestion) {
          currentQuestion.difficulty = line.split(':')[1].trim().toLowerCase();
        }
      } else if (line.startsWith('分值:') || line.startsWith('Score:')) {
        if (currentQuestion) {
          const scoreStr = line.split(':')[1].trim();
          currentQuestion.score = parseInt(scoreStr) || 0;
        }
      } else if (line.startsWith('类型:') || line.startsWith('Type:')) {
        if (currentQuestion) {
          currentQuestion.type = line.split(':')[1].trim().toLowerCase();
        }
      } else if (line && currentQuestion) {
        contentBuffer.push(line);
      }
    }

    // 保存最后一个问题
    if (currentQuestion) {
      currentQuestion.content = contentBuffer.join('\n').trim();
      questions.push({
        id: `q-${file.id}-${questions.length}`,
        fileId: file.id,
        title: currentQuestion.title || '',
        content: currentQuestion.content || '',
        type: currentQuestion.type,
        difficulty: currentQuestion.difficulty,
        score: currentQuestion.score,
      });
    }

    return questions;
  }

  /**
   * 检测问题类型
   */
  private static detectQuestionType(title: string): string {
    const lowerTitle = title.toLowerCase();

    if (lowerTitle.includes('单选')) return 'single-choice';
    if (lowerTitle.includes('多选')) return 'multiple-choice';
    if (lowerTitle.includes('填空')) return 'fill-blank';
    if (lowerTitle.includes('简答') || lowerTitle.includes('解答')) return 'short-answer';
    if (lowerTitle.includes('论述')) return 'essay';

    return 'unknown';
  }

  /**
   * 检测难度
   */
  private static detectDifficulty(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('简单') || lowerText.includes('easy')) return 'easy';
    if (lowerText.includes('中等') || lowerText.includes('medium')) return 'medium';
    if (lowerText.includes('困难') || lowerText.includes('hard')) return 'hard';

    return 'medium';
  }

  /**
   * 检测分值
   */
  private static detectScore(text: string): number {
    const match = text.match(/(\d+)\s*分/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 从题库中筛选问题
   */
  static filterQuestions(
    bankId: string,
    criteria: {
      types?: string[];
      difficulties?: string[];
      fileIds?: string[];
      keyword?: string;
    }
  ): QuestionBankQuestion[] {
    const bank = this.getBank(bankId);
    if (!bank) return [];

    let questions: QuestionBankQuestion[] = [];

    // 按文件筛选
    const fileIds = criteria.fileIds || bank.files.map((f) => f.id);
    bank.files.forEach((file) => {
      if (fileIds.includes(file.id) && file.questions) {
        questions.push(...file.questions);
      }
    });

    // 按类型筛选
    if (criteria.types && criteria.types.length > 0) {
      questions = questions.filter((q) => criteria.types!.includes(q.type || 'unknown'));
    }

    // 按难度筛选
    if (criteria.difficulties && criteria.difficulties.length > 0) {
      questions = questions.filter((q) => criteria.difficulties!.includes(q.difficulty || 'medium'));
    }

    // 按关键词筛选
    if (criteria.keyword) {
      const keyword = criteria.keyword.toLowerCase();
      questions = questions.filter(
        (q) =>
          q.title.toLowerCase().includes(keyword) ||
          q.content.toLowerCase().includes(keyword)
      );
    }

    return questions;
  }

  /**
   * 生成试卷 Markdown
   */
  static generateExamMarkdown(questions: QuestionBankQuestion[], title: string = '试卷'): string {
    let markdown = `# ${title}\n\n`;
    let totalScore = 0;

    questions.forEach((q, index) => {
      markdown += `## 题目 ${index + 1}\n\n`;
      markdown += `${q.content}\n\n`;

      if (q.score) {
        markdown += `**分值**: ${q.score}分\n\n`;
        totalScore += q.score;
      }

      if (q.difficulty) {
        markdown += `**难度**: ${q.difficulty}\n\n`;
      }

      markdown += '---\n\n';
    });

    markdown = `# ${title}\n\n**总分**: ${totalScore}分\n\n${markdown}`;

    return markdown;
  }

  /**
   * 导出题库为 JSON
   */
  static exportBankAsJson(bankId: string): string {
    const bank = this.getBank(bankId);
    if (!bank) return '';

    return JSON.stringify(bank, null, 2);
  }

  /**
   * 导入题库从 JSON
   */
  static importBankFromJson(jsonStr: string): QuestionBank {
    const bank = JSON.parse(jsonStr) as QuestionBank;
    bank.id = `bank-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    bank.createdAt = new Date();
    bank.updatedAt = new Date();

    this.saveBank(bank);
    return bank;
  }
}
