/**
 * 文档转换服务
 * 支持 PDF、Word、TXT 等格式转换为 Markdown
 */

export interface ConversionResult {
  markdown: string;
  fileName: string;
  originalFormat: string;
  convertedAt: Date;
  pageCount?: number;
  wordCount?: number;
}

/**
 * 解析 TXT 文件
 */
export async function parseTxtFile(file: File): Promise<ConversionResult> {
  const text = await file.text();
  const lines = text.split('\n');

  // 简单的 TXT 转 Markdown 处理
  let markdown = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      markdown += '\n';
      continue;
    }

    // 检测标题（全大写或以特殊符号开头）
    if (
      line.toUpperCase() === line &&
      line.length > 0 &&
      line.length < 50 &&
      !line.includes('。') &&
      !line.includes('，')
    ) {
      markdown += `## ${line}\n\n`;
    }
    // 检测列表
    else if (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line)) {
      markdown += `${line}\n`;
    }
    // 普通段落
    else {
      markdown += `${line}\n`;
    }
  }

  return {
    markdown,
    fileName: file.name.replace(/\.txt$/i, ''),
    originalFormat: 'txt',
    convertedAt: new Date(),
    wordCount: text.split(/\s+/).length,
  };
}

/**
 * 使用 pdf.js 解析 PDF 文件
 */
export async function parsePdfFile(file: File): Promise<ConversionResult> {
  try {
    // 动态导入 pdf.js
    const pdfjsLib = await import('pdfjs-dist');

    // 设置 worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let markdown = `# ${file.name.replace(/\.pdf$/i, '')}\n\n`;
    let totalText = '';

    // 提取每一页的文本
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      markdown += `## 第 ${pageNum} 页\n\n`;

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join('')
        .trim();

      if (pageText) {
        markdown += `${pageText}\n\n`;
        totalText += pageText + '\n';
      }
    }

    return {
      markdown,
      fileName: file.name.replace(/\.pdf$/i, ''),
      originalFormat: 'pdf',
      convertedAt: new Date(),
      pageCount: pdf.numPages,
      wordCount: totalText.split(/\s+/).length,
    };
  } catch (error) {
    console.error('PDF 解析失败:', error);
    throw new Error('PDF 文件解析失败，请确保文件格式正确');
  }
}

/**
 * 使用 mammoth 解析 Word 文件
 */
export async function parseWordFile(file: File): Promise<ConversionResult> {
  try {
    // 动态导入 mammoth
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    // 将 HTML 转换为 Markdown
    let markdown = htmlToMarkdown(result.value);

    // 统计字数
    const plainText = markdown.replace(/[#*`\[\]()]/g, '');
    const wordCount = plainText.split(/\s+/).length;

    return {
      markdown,
      fileName: file.name.replace(/\.(docx?|doc)$/i, ''),
      originalFormat: 'word',
      convertedAt: new Date(),
      wordCount,
    };
  } catch (error) {
    console.error('Word 解析失败:', error);
    throw new Error('Word 文件解析失败，请确保文件格式正确');
  }
}

/**
 * 简单的 HTML 转 Markdown
 */
function htmlToMarkdown(html: string): string {
  let markdown = html;

  // 标题
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // 段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // 粗体
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

  // 斜体
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // 列表
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '\n');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // 有序列表
  markdown = markdown.replace(/<ol[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ol>/gi, '\n');
  let olCounter = 0;
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, () => {
    olCounter++;
    return `${olCounter}. $1\n`;
  });

  // 代码块
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```\n');

  // 链接
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // 图片
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)');
  markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)');

  // 删除 HTML 标签
  markdown = markdown.replace(/<[^>]*>/g, '');

  // 清理多余空行
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  return markdown.trim();
}

/**
 * 通用文件转换函数
 */
export async function convertFileToMarkdown(file: File): Promise<ConversionResult> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.txt')) {
    return parseTxtFile(file);
  } else if (fileName.endsWith('.pdf')) {
    return parsePdfFile(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return parseWordFile(file);
  } else {
    throw new Error(`不支持的文件格式: ${file.type}`);
  }
}

/**
 * 从 Markdown 中提取问题
 */
export interface ExtractedQuestion {
  id: string;
  title: string;
  content: string;
  source: string;
  pageNumber?: number;
}

export function extractQuestionsFromMarkdown(
  markdown: string,
  source: string
): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = [];

  // 按 ## 或 ### 分割
  const sections = markdown.split(/^###?\s+/m);

  sections.forEach((section, index) => {
    if (!section.trim()) return;

    const lines = section.split('\n');
    const title = lines[0].trim();

    if (title.length > 0 && title.length < 200) {
      questions.push({
        id: `${source}-${index}`,
        title,
        content: section.trim(),
        source,
        pageNumber: Math.floor(index / 5) + 1, // 估计页码
      });
    }
  });

  return questions;
}
