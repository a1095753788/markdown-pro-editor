/**
 * 文件格式转换服务
 * 支持将多种格式转换为 Markdown
 */

/**
 * 将 HTML 转换为 Markdown
 */
export function htmlToMarkdown(html: string): string {
  let markdown = html;

  // 移除 HTML 标签
  markdown = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  markdown = markdown.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 标题
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

  // 段落
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // 加粗
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

  // 斜体
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // 代码
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
  markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gi, '```\n$1\n```');

  // 链接
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // 图片
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');

  // 列表
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
    let items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return items.map((item: string) => '- ' + item.replace(/<\/?li[^>]*>/gi, '').trim()).join('\n') + '\n';
  });

  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
    let items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
    return items.map((item: string, index: number) => `${index + 1}. ` + item.replace(/<\/?li[^>]*>/gi, '').trim()).join('\n') + '\n';
  });

  // 引用
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (match, content) => {
    return content.split('\n').map((line: string) => '> ' + line.trim()).join('\n') + '\n';
  });

  // 水平线
  markdown = markdown.replace(/<hr[^>]*>/gi, '---\n');

  // 清理多余的换行
  markdown = markdown.replace(/\n\n\n+/g, '\n\n');

  return markdown.trim();
}

/**
 * 将纯文本转换为 Markdown
 */
export function textToMarkdown(text: string): string {
  // 检测标题（以数字或特殊符号开头的行）
  let markdown = text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      // 检测标题模式
      if (/^#+\s/.test(trimmed)) {
        return trimmed;
      }

      // 检测列表
      if (/^[-*+]\s/.test(trimmed)) {
        return trimmed;
      }

      // 检测有序列表
      if (/^\d+\.\s/.test(trimmed)) {
        return trimmed;
      }

      // 检测代码块
      if (/^```/.test(trimmed)) {
        return trimmed;
      }

      return line;
    })
    .join('\n');

  return markdown;
}

/**
 * 将 CSV 转换为 Markdown 表格
 */
export function csvToMarkdown(csv: string): string {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return '';

  // 解析 CSV
  const rows = lines.map((line) => {
    // 简单的 CSV 解析（不处理复杂的转义）
    return line.split(',').map((cell) => cell.trim());
  });

  if (rows.length === 0) return '';

  // 生成 Markdown 表格
  let markdown = '';

  // 表头
  markdown += '| ' + rows[0].join(' | ') + ' |\n';
  markdown += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';

  // 数据行
  for (let i = 1; i < rows.length; i++) {
    markdown += '| ' + rows[i].join(' | ') + ' |\n';
  }

  return markdown;
}

/**
 * 将 JSON 转换为 Markdown
 */
export function jsonToMarkdown(json: string): string {
  try {
    const data = JSON.parse(json);
    return jsonObjectToMarkdown(data);
  } catch (error) {
    return '```json\n' + json + '\n```';
  }
}

function jsonObjectToMarkdown(obj: any, depth: number = 0): string {
  const indent = '#'.repeat(Math.min(depth + 1, 6));
  let markdown = '';

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        markdown += `${indent} 项目 ${index + 1}\n\n`;
        markdown += jsonObjectToMarkdown(item, depth + 1);
      } else {
        markdown += `- ${item}\n`;
      }
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        markdown += `${indent} ${key}\n\n`;
        markdown += jsonObjectToMarkdown(value, depth + 1);
      } else {
        markdown += `**${key}**: ${value}\n\n`;
      }
    });
  }

  return markdown;
}

/**
 * 将 XML 转换为 Markdown
 */
export function xmlToMarkdown(xml: string): string {
  // 移除 XML 声明和注释
  let markdown = xml
    .replace(/<\?xml[^?]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // 提取文本内容
  markdown = markdown.replace(/<([^>]+)>([^<]*)<\/\1>/g, '**$1**: $2\n');
  markdown = markdown.replace(/<([^>]+)>([^<]*)/g, '**$1**: $2\n');
  markdown = markdown.replace(/<\/[^>]+>/g, '');

  return markdown.trim();
}

/**
 * 将 Word 文档文本内容转换为 Markdown
 * （需要先将 .docx 转换为文本）
 */
export function wordTextToMarkdown(text: string): string {
  return textToMarkdown(text);
}

/**
 * 将 PDF 文本内容转换为 Markdown
 * （需要先从 PDF 提取文本）
 */
export function pdfTextToMarkdown(text: string): string {
  return textToMarkdown(text);
}

/**
 * 通用文件转换函数
 */
export function convertToMarkdown(
  content: string,
  fromFormat: 'html' | 'text' | 'csv' | 'json' | 'xml' | 'markdown'
): string {
  switch (fromFormat) {
    case 'html':
      return htmlToMarkdown(content);
    case 'csv':
      return csvToMarkdown(content);
    case 'json':
      return jsonToMarkdown(content);
    case 'xml':
      return xmlToMarkdown(content);
    case 'text':
      return textToMarkdown(content);
    case 'markdown':
      return content;
    default:
      return content;
  }
}

/**
 * 检测文件格式
 */
export function detectFileFormat(
  content: string,
  fileName: string
): 'html' | 'text' | 'csv' | 'json' | 'xml' | 'markdown' {
  // 根据文件名检测
  if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
    return 'markdown';
  }
  if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
    return 'html';
  }
  if (fileName.endsWith('.csv')) {
    return 'csv';
  }
  if (fileName.endsWith('.json')) {
    return 'json';
  }
  if (fileName.endsWith('.xml')) {
    return 'xml';
  }

  // 根据内容检测
  const trimmed = content.trim();

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // 不是有效的 JSON
    }
  }

  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    if (trimmed.includes('<!DOCTYPE') || trimmed.includes('<html')) {
      return 'html';
    }
    if (trimmed.includes('<?xml')) {
      return 'xml';
    }
  }

  if (trimmed.includes(',') && !trimmed.includes('\n')) {
    return 'csv';
  }

  if (trimmed.includes('|') && trimmed.includes('-')) {
    return 'markdown';
  }

  return 'text';
}

/**
 * 获取支持的文件格式
 */
export const SUPPORTED_FORMATS = {
  markdown: {
    name: 'Markdown',
    extensions: ['.md', '.markdown'],
    mimeType: 'text/markdown',
  },
  html: {
    name: 'HTML',
    extensions: ['.html', '.htm'],
    mimeType: 'text/html',
  },
  text: {
    name: 'Plain Text',
    extensions: ['.txt'],
    mimeType: 'text/plain',
  },
  csv: {
    name: 'CSV',
    extensions: ['.csv'],
    mimeType: 'text/csv',
  },
  json: {
    name: 'JSON',
    extensions: ['.json'],
    mimeType: 'application/json',
  },
  xml: {
    name: 'XML',
    extensions: ['.xml'],
    mimeType: 'text/xml',
  },
};
