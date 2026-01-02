/**
 * 导出模板和样式定制
 * 支持 PDF 和 Word 格式导出，自定义页眉页脚、班级信息等
 */

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'word';
  settings: ExportSettings;
  createdAt: Date;
  isDefault?: boolean;
}

export interface ExportSettings {
  // 页面设置
  pageSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  // 页眉页脚
  header: {
    enabled: boolean;
    content: string;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
  };
  footer: {
    enabled: boolean;
    content: string;
    fontSize: number;
    alignment: 'left' | 'center' | 'right';
    pageNumber: boolean;
  };

  // 班级和学生信息
  schoolInfo: {
    enabled: boolean;
    schoolName: string;
    grade: string;
    className: string;
    subject: string;
    examDate: string;
    duration: string; // 考试时长
  };

  // 学生信息
  studentInfo: {
    enabled: boolean;
    studentName: string;
    studentId: string;
    seatNumber: string;
  };

  // 样式设置
  styles: {
    titleFontSize: number;
    headingFontSize: number;
    bodyFontSize: number;
    lineHeight: number;
    fontFamily: string;
    titleColor: string;
    headingColor: string;
    bodyColor: string;
  };

  // 试卷特殊设置
  examSettings: {
    showTotalScore: boolean;
    showAnswerArea: boolean;
    answerAreaHeight: number;
    questionNumbering: boolean;
    showDifficulty: boolean;
    showScore: boolean;
  };
}

/**
 * 默认导出设置
 */
export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
  header: {
    enabled: true,
    content: '',
    fontSize: 10,
    alignment: 'center',
  },
  footer: {
    enabled: true,
    content: '',
    fontSize: 10,
    alignment: 'center',
    pageNumber: true,
  },
  schoolInfo: {
    enabled: true,
    schoolName: '',
    grade: '',
    className: '',
    subject: '',
    examDate: new Date().toLocaleDateString('zh-CN'),
    duration: '120分钟',
  },
  studentInfo: {
    enabled: false,
    studentName: '',
    studentId: '',
    seatNumber: '',
  },
  styles: {
    titleFontSize: 24,
    headingFontSize: 16,
    bodyFontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'SimSun, Arial',
    titleColor: '#000000',
    headingColor: '#333333',
    bodyColor: '#000000',
  },
  examSettings: {
    showTotalScore: true,
    showAnswerArea: true,
    answerAreaHeight: 50,
    questionNumbering: true,
    showDifficulty: false,
    showScore: true,
  },
};

/**
 * 预设模板
 */
export const PRESET_TEMPLATES: ExportTemplate[] = [
  {
    id: 'standard-exam',
    name: '标准试卷',
    description: '适用于中小学标准试卷格式',
    format: 'pdf',
    createdAt: new Date(),
    settings: {
      ...DEFAULT_EXPORT_SETTINGS,
      header: {
        enabled: true,
        content: '',
        fontSize: 10,
        alignment: 'center',
      },
      schoolInfo: {
        enabled: true,
        schoolName: '',
        grade: '',
        className: '',
        subject: '',
        examDate: new Date().toLocaleDateString('zh-CN'),
        duration: '120分钟',
      },
      examSettings: {
        showTotalScore: true,
        showAnswerArea: true,
        answerAreaHeight: 50,
        questionNumbering: true,
        showDifficulty: false,
        showScore: true,
      },
    },
    isDefault: true,
  },
  {
    id: 'homework-sheet',
    name: '作业单',
    description: '适用于课堂作业和练习题单',
    format: 'pdf',
    createdAt: new Date(),
    settings: {
      ...DEFAULT_EXPORT_SETTINGS,
      pageSize: 'A4',
      margins: { top: 15, bottom: 15, left: 15, right: 15 },
      styles: {
        ...DEFAULT_EXPORT_SETTINGS.styles,
        titleFontSize: 18,
        headingFontSize: 14,
        bodyFontSize: 11,
      },
      examSettings: {
        showTotalScore: false,
        showAnswerArea: true,
        answerAreaHeight: 30,
        questionNumbering: true,
        showDifficulty: true,
        showScore: false,
      },
    },
  },
  {
    id: 'quiz-sheet',
    name: '小测验',
    description: '适用于课堂小测验和随堂测试',
    format: 'pdf',
    createdAt: new Date(),
    settings: {
      ...DEFAULT_EXPORT_SETTINGS,
      pageSize: 'A4',
      margins: { top: 10, bottom: 10, left: 10, right: 10 },
      styles: {
        ...DEFAULT_EXPORT_SETTINGS.styles,
        titleFontSize: 16,
        headingFontSize: 13,
        bodyFontSize: 10,
      },
      examSettings: {
        showTotalScore: true,
        showAnswerArea: false,
        answerAreaHeight: 0,
        questionNumbering: true,
        showDifficulty: false,
        showScore: true,
      },
    },
  },
];

/**
 * 导出模板管理类
 */
export class ExportTemplateManager {
  private static readonly STORAGE_KEY = 'markdown-editor-export-templates';

  /**
   * 获取所有模板
   */
  static getAllTemplates(): ExportTemplate[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const customTemplates = data ? JSON.parse(data) : [];
    return [...PRESET_TEMPLATES, ...customTemplates];
  }

  /**
   * 获取单个模板
   */
  static getTemplate(id: string): ExportTemplate | undefined {
    return this.getAllTemplates().find((t) => t.id === id);
  }

  /**
   * 保存自定义模板
   */
  static saveTemplate(template: ExportTemplate): void {
    const templates = this.getAllTemplates().filter((t) => !t.isDefault);
    const index = templates.findIndex((t) => t.id === template.id);

    if (index >= 0) {
      templates[index] = template;
    } else {
      template.id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      templates.push(template);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }

  /**
   * 删除模板
   */
  static deleteTemplate(id: string): void {
    const templates = this.getAllTemplates().filter((t) => !t.isDefault);
    const filtered = templates.filter((t) => t.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * 获取默认模板
   */
  static getDefaultTemplate(): ExportTemplate {
    return PRESET_TEMPLATES[0];
  }

  /**
   * 生成 HTML 用于打印
   */
  static generatePrintHTML(
    content: string,
    template: ExportTemplate,
    title: string = ''
  ): string {
    const settings = template.settings;
    const styles = settings.styles;

    // 计算页边距
    const marginStyle = `
      margin-top: ${settings.margins.top}mm;
      margin-bottom: ${settings.margins.bottom}mm;
      margin-left: ${settings.margins.left}mm;
      margin-right: ${settings.margins.right}mm;
    `;

    // 构建页眉
    let headerHTML = '';
    if (settings.header.enabled && settings.header.content) {
      headerHTML = `
        <div style="text-align: ${settings.header.alignment}; font-size: ${settings.header.fontSize}pt; margin-bottom: 10mm; border-bottom: 1px solid #ccc; padding-bottom: 5mm;">
          ${settings.header.content}
        </div>
      `;
    }

    // 构建学校信息
    let schoolInfoHTML = '';
    if (settings.schoolInfo.enabled) {
      const info = settings.schoolInfo;
      schoolInfoHTML = `
        <div style="text-align: center; margin-bottom: 10mm; font-size: ${styles.bodyFontSize}pt;">
          ${info.schoolName ? `<p style="margin: 2mm 0;">${info.schoolName}</p>` : ''}
          ${info.subject ? `<p style="margin: 2mm 0;"><strong>${info.subject}试卷</strong></p>` : ''}
          ${info.grade ? `<p style="margin: 2mm 0;">年级: ${info.grade}</p>` : ''}
          ${info.className ? `<p style="margin: 2mm 0;">班级: ${info.className}</p>` : ''}
          ${info.examDate ? `<p style="margin: 2mm 0;">日期: ${info.examDate}</p>` : ''}
          ${info.duration ? `<p style="margin: 2mm 0;">考试时长: ${info.duration}</p>` : ''}
        </div>
      `;
    }

    // 构建学生信息
    let studentInfoHTML = '';
    if (settings.studentInfo.enabled) {
      const info = settings.studentInfo;
      studentInfoHTML = `
        <div style="margin-bottom: 10mm; font-size: ${styles.bodyFontSize}pt;">
          ${info.studentName ? `<p>姓名: ________________</p>` : ''}
          ${info.studentId ? `<p>学号: ________________</p>` : ''}
          ${info.seatNumber ? `<p>座号: ________________</p>` : ''}
        </div>
      `;
    }

    // 构建页脚
    let footerHTML = '';
    if (settings.footer.enabled) {
      let footerContent = settings.footer.content;
      if (settings.footer.pageNumber) {
        footerContent += ' <span class="page-number"></span>';
      }
      footerHTML = `
        <div style="text-align: ${settings.footer.alignment}; font-size: ${settings.footer.fontSize}pt; margin-top: 10mm; border-top: 1px solid #ccc; padding-top: 5mm;">
          ${footerContent}
        </div>
      `;
    }

    // 完整 HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: ${styles.fontFamily};
            line-height: ${styles.lineHeight};
            color: ${styles.bodyColor};
            ${marginStyle}
          }
          
          @page {
            size: ${settings.pageSize} ${settings.orientation};
            margin: ${settings.margins.top}mm ${settings.margins.right}mm ${settings.margins.bottom}mm ${settings.margins.left}mm;
          }
          
          h1 {
            font-size: ${styles.titleFontSize}pt;
            color: ${styles.titleColor};
            text-align: center;
            margin-bottom: 10mm;
          }
          
          h2, h3 {
            font-size: ${styles.headingFontSize}pt;
            color: ${styles.headingColor};
            margin-top: 5mm;
            margin-bottom: 3mm;
          }
          
          p {
            font-size: ${styles.bodyFontSize}pt;
            margin-bottom: 2mm;
          }
          
          .answer-area {
            min-height: ${settings.examSettings.answerAreaHeight}mm;
            border: 1px dashed #999;
            padding: 3mm;
            margin: 5mm 0;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        ${headerHTML}
        ${schoolInfoHTML}
        ${studentInfoHTML}
        <div class="content">
          ${title ? `<h1>${title}</h1>` : ''}
          ${content}
        </div>
        ${footerHTML}
      </body>
      </html>
    `;

    return html;
  }

  /**
   * 导出为 PDF（使用浏览器打印功能）
   */
  static exportAsPDF(content: string, template: ExportTemplate, filename: string): void {
    const html = this.generatePrintHTML(content, template, filename);
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }
}
