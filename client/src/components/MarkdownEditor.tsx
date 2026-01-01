import React, { useState, useCallback, useRef } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PrintSettingsDialog, { PrintSettings } from '@/components/PrintSettings';
import FormatPanel, { FormatOptions } from '@/components/FormatPanel';
import {
  FileText,
  Save,
  Download,
  Printer,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image,
  Quote,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import 'highlight.js/styles/atom-one-light.css';
import 'katex/dist/katex.min.css';

interface EditorState {
  content: string;
  fileName: string;
  isDirty: boolean;
  previewVisible: boolean;
  printSettings: PrintSettings;
  formatOptions: FormatOptions;
}

export default function MarkdownEditor() {
  const [state, setState] = useState<EditorState>({
    content: '# 欢迎使用 Markdown Pro Editor\n\n开始编辑您的 Markdown 文档...\n\n## 支持的功能\n\n- 实时预览\n- 数学公式 (KaTeX)\n- 代码高亮\n- 自定义打印\n\n### 示例公式\n\n$$E = mc^2$$\n\n### 代码示例\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```',
    fileName: '未命名文档.md',
    isDirty: false,
    previewVisible: true,
    printSettings: {
      paperSize: 'A4',
      orientation: 'portrait',
      marginTop: 20,
      marginRight: 20,
      marginBottom: 20,
      marginLeft: 20,
      fontSize: 12,
      lineHeight: 1.5,
    },
    formatOptions: {
      headingSize: 28,
      bodySize: 14,
      lineHeight: 1.6,
      letterSpacing: 0,
      fontFamily: 'sans-serif',
      textColor: '#2c2c2c',
      backgroundColor: '#ffffff',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({
      ...prev,
      content: e.target.value,
      isDirty: true,
    }));
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = state.content.substring(start, end) || '文本';
    const newContent =
      state.content.substring(0, start) +
      before +
      selectedText +
      after +
      state.content.substring(end);

    setState((prev) => ({
      ...prev,
      content: newContent,
      isDirty: true,
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
    }, 0);
  }, [state.content]);

  const handleNewFile = useCallback(() => {
    if (state.isDirty) {
      if (!confirm('当前文档未保存，确定要新建吗？')) return;
    }
    setState((prev) => ({
      ...prev,
      content: '',
      fileName: '未命名文档.md',
      isDirty: false,
      previewVisible: true,
    }));
  }, [state.isDirty]);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setState((prev) => ({
        ...prev,
        content,
        fileName: file.name,
        isDirty: false,
        previewVisible: true,
      }));
    };
    reader.readAsText(file);
  }, []);

  const handleSaveFile = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([state.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = state.fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setState((prev) => ({
      ...prev,
      isDirty: false,
    }));
  }, [state.content, state.fileName]);

  const handleExportHTML = useCallback(() => {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${state.fileName}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-light.min.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #2c2c2c;
      background-color: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 32px; }
    h2 { font-size: 24px; }
    h3 { font-size: 20px; }
    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Roboto Mono', monospace;
      font-size: 14px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 16px 0;
    }
    pre code {
      background-color: transparent;
      padding: 0;
      border-radius: 0;
    }
    blockquote {
      border-left: 4px solid #0066cc;
      margin: 16px 0;
      padding-left: 16px;
      color: #666;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #e8e8e8;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${renderMarkdown(state.content)}
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/highlight.min.js"></script>
</body>
</html>`;

    const element = document.createElement('a');
    const file = new Blob([html], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = state.fileName.replace('.md', '.html');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }, [state.content, state.fileName]);

  const handlePrint = useCallback(() => {
    const { paperSize, orientation, marginTop, marginRight, marginBottom, marginLeft, fontSize, lineHeight } = state.printSettings;
    
    const paperSizes: Record<string, { width: number; height: number }> = {
      A4: { width: 210, height: 297 },
      A3: { width: 297, height: 420 },
      Letter: { width: 215.9, height: 279.4 },
      Legal: { width: 215.9, height: 355.6 },
    };

    const paper = paperSizes[paperSize];
    const [width, height] = orientation === 'portrait' ? [paper.width, paper.height] : [paper.height, paper.width];

    if (printContentRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>${state.fileName}</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/atom-one-light.min.css">
            <style>
              @page {
                size: ${width}mm ${height}mm ${orientation};
                margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                line-height: ${lineHeight};
                color: #2c2c2c;
                font-size: ${fontSize}pt;
              }
              h1, h2, h3, h4, h5, h6 {
                margin-top: 16px;
                margin-bottom: 12px;
                font-weight: 600;
              }
              h1 { font-size: ${fontSize * 2}pt; }
              h2 { font-size: ${fontSize * 1.75}pt; }
              h3 { font-size: ${fontSize * 1.5}pt; }
              code {
                background-color: #f5f5f5;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                font-size: ${fontSize * 0.9}pt;
              }
              pre {
                background-color: #f5f5f5;
                padding: 12px;
                border-radius: 4px;
                overflow-x: auto;
                margin: 12px 0;
              }
              pre code {
                background-color: transparent;
                padding: 0;
              }
              blockquote {
                border-left: 3px solid #0066cc;
                margin: 12px 0;
                padding-left: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            ${renderMarkdown(state.content)}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }, [state.content, state.fileName, state.printSettings]);

  const handleUndo = useCallback(() => {
    // 简单的撤销功能，实际项目中应使用更完善的历史记录系统
    alert('撤销功能将在后续版本中实现');
  }, []);

  const htmlContent = renderMarkdown(state.content);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 顶部工具栏 */}
      <div className="border-b border-border bg-card">
        {/* 文件操作栏 */}
        <div className="flex items-center gap-2 p-3 border-b border-border">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewFile}
              title="新建文件 (Ctrl+N)"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              新建
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenFile}
              title="打开文件 (Ctrl+O)"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              打开
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveFile}
              title="保存文件 (Ctrl+S)"
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHTML}
              title="导出为 HTML"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              导出 HTML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrintDialogOpen(true)}
              title="打印 (Ctrl+P)"
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              打印
            </Button>
            <FormatPanel
              options={state.formatOptions}
              onOptionsChange={(formatOptions) =>
                setState((prev) => ({ ...prev, formatOptions }))
              }
            />
          </div>

          <div className="flex-1" />

          <div className="text-sm text-muted-foreground">
            {state.fileName}
            {state.isDirty && ' *'}
          </div>
        </div>

        {/* 格式化工具栏 */}
        <div className="flex items-center gap-1 p-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('**', '**')}
            title="加粗 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('*', '*')}
            title="斜体 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('`', '`')}
            title="代码"
          >
            <Code className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('# ')}
            title="标题 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('## ')}
            title="标题 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('- ')}
            title="无序列表"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('1. ')}
            title="有序列表"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('[', '](url)')}
            title="链接"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('![alt](', ')')}
            title="图片"
          >
            <Image className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown('> ')}
            title="引用"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            title="撤销"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                previewVisible: !prev.previewVisible,
              }))
            }
            title={state.previewVisible ? '隐藏预览' : '显示预览'}
          >
            {state.previewVisible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* 编辑区和预览区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 编辑区 */}
        <div className="flex-1 flex flex-col border-r border-border">
          <Textarea
            value={state.content}
            onChange={handleContentChange}
            placeholder="在这里输入 Markdown..."
            className="flex-1 resize-none border-0 rounded-none font-mono text-sm"
            spellCheck="false"
          />
        </div>

        {/* 预览区 */}
        {state.previewVisible && (
          <div className="flex-1 overflow-auto bg-card">
            <div
              ref={printContentRef}
              className="prose prose-sm max-w-none p-8"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              style={{
                fontFamily: state.formatOptions.fontFamily === 'serif' 
                  ? 'Georgia, serif'
                  : state.formatOptions.fontFamily === 'mono'
                  ? '"Roboto Mono", monospace'
                  : '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                color: state.formatOptions.textColor,
                backgroundColor: state.formatOptions.backgroundColor,
                lineHeight: state.formatOptions.lineHeight,
                letterSpacing: `${state.formatOptions.letterSpacing}px`,
              }}
            />
          </div>
        )}

        {/* 打印设置对话框 */}
        <PrintSettingsDialog
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          settings={state.printSettings}
          onSettingsChange={(printSettings) =>
            setState((prev) => ({ ...prev, printSettings }))
          }
          onPrint={handlePrint}
        />
      </div>
    </div>
  );
}
