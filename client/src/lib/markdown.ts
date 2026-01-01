import MarkdownIt from 'markdown-it';
import markdownItKatex from 'markdown-it-katex';
import hljs from 'highlight.js';

// 创建 Markdown 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {
        // 如果高亮失败，返回原始代码
      }
    }
    return '';
  }
});

// 添加 KaTeX 支持
md.use(markdownItKatex);

export function renderMarkdown(content: string): string {
  return md.render(content);
}

export default md;
