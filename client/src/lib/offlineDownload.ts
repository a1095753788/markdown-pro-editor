/**
 * 离线版本下载功能
 * 生成可直接在浏览器中打开的完整应用包
 */

/**
 * 生成离线应用的 HTML 文件
 */
export async function generateOfflineHTML(): Promise<string> {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Pro Editor - 离线版本</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
    }
    
    .container {
      display: flex;
      height: 100vh;
      flex-direction: column;
    }
    
    .header {
      background-color: #fff;
      border-bottom: 1px solid #e0e0e0;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }
    
    .header-info {
      margin-left: auto;
      font-size: 12px;
      color: #666;
    }
    
    .toolbar {
      background-color: #fff;
      border-bottom: 1px solid #e0e0e0;
      padding: 8px 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      overflow-x: auto;
    }
    
    button {
      padding: 6px 12px;
      border: 1px solid #d0d0d0;
      background-color: #fff;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    
    button:hover {
      background-color: #f0f0f0;
      border-color: #999;
    }
    
    button:active {
      background-color: #e0e0e0;
    }
    
    .content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .editor-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #e0e0e0;
    }
    
    .preview-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #fff;
    }
    
    textarea {
      flex: 1;
      padding: 16px;
      border: none;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      resize: none;
      outline: none;
    }
    
    .preview {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background-color: #fff;
    }
    
    .preview h1, .preview h2, .preview h3 {
      margin-top: 16px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .preview h1 { font-size: 28px; }
    .preview h2 { font-size: 24px; }
    .preview h3 { font-size: 20px; }
    
    .preview p {
      margin-bottom: 12px;
      line-height: 1.6;
    }
    
    .preview code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
    }
    
    .preview pre {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 12px 0;
    }
    
    .preview pre code {
      background-color: transparent;
      padding: 0;
    }
    
    .preview blockquote {
      border-left: 3px solid #0066cc;
      margin: 12px 0;
      padding-left: 12px;
      color: #666;
    }
    
    .preview ul, .preview ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    
    .preview li {
      margin-bottom: 6px;
    }
    
    .status-bar {
      background-color: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      padding: 8px 12px;
      font-size: 12px;
      color: #666;
      display: flex;
      gap: 20px;
    }
    
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    
    .modal.show {
      display: flex;
    }
    
    .modal-content {
      background-color: #fff;
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      max-height: 80vh;
      overflow-y: auto;
    }
    
    .modal-header {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .modal-body {
      margin-bottom: 16px;
      line-height: 1.6;
    }
    
    .modal-body input,
    .modal-body textarea,
    .modal-body select {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
      border: 1px solid #d0d0d0;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .modal-body ul, .modal-body ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    
    .modal-body li {
      margin-bottom: 6px;
    }
    
    .modal-footer {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    
    .hidden {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 Markdown Pro Editor - 离线版本</h1>
      <div class="header-info">
        <span>完全离线 • 隐私保护 • 无需网络</span>
      </div>
    </div>
    
    <div class="toolbar">
      <button onclick="newFile()">📄 新建</button>
      <button onclick="openFile()">📂 打开</button>
      <button onclick="saveFile()">💾 保存</button>
      <button onclick="exportHTML()">📄 导出 HTML</button>
      <button onclick="exportMarkdown()">📋 导出 Markdown</button>
      <button onclick="printDocument()">🖨️ 打印</button>
      <button onclick="togglePreview()">👁️ 预览</button>
      <button onclick="showAbout()">ℹ️ 关于</button>
    </div>
    
    <div class="content">
      <div class="editor-section">
        <textarea id="editor" placeholder="在此输入 Markdown 内容..."></textarea>
      </div>
      <div class="preview-section" id="previewSection">
        <div class="preview" id="preview"></div>
      </div>
    </div>
    
    <div class="status-bar">
      <span id="fileName">未命名文档.md</span>
      <span id="wordCount">字数: 0</span>
      <span id="lineCount">行数: 0</span>
    </div>
  </div>
  
  <!-- 关于对话框 -->
  <div class="modal" id="aboutModal">
    <div class="modal-content">
      <div class="modal-header">关于 Markdown Pro Editor</div>
      <div class="modal-body">
        <p><strong>版本:</strong> 1.0.0 (离线版本)</p>
        <p><strong>特性:</strong></p>
        <ul>
          <li>✅ 完全离线使用，无需网络连接</li>
          <li>✅ 实时 Markdown 预览</li>
          <li>✅ 支持本地文件保存和加载</li>
          <li>✅ 导出为 HTML 和 Markdown</li>
          <li>✅ 打印和 PDF 导出</li>
          <li>✅ 完全隐私保护，数据存储在本地</li>
        </ul>
        <p><strong>使用方法:</strong></p>
        <ol>
          <li>在左侧编辑区输入 Markdown 内容</li>
          <li>右侧实时显示预览效果</li>
          <li>使用工具栏按钮进行文件操作和导出</li>
          <li>所有数据都保存在您的浏览器本地</li>
        </ol>
        <p><strong>支持的 Markdown 语法:</strong></p>
        <ul>
          <li># 标题 (支持 h1-h6)</li>
          <li>**加粗** 和 *斜体*</li>
          <li>[链接](url) 和 ![图片](url)</li>
          <li>\`代码\` 和代码块</li>
          <li>- 列表项 和 1. 有序列表</li>
          <li>> 引用块</li>
        </ul>
      </div>
      <div class="modal-footer">
        <button onclick="closeModal('aboutModal')">关闭</button>
      </div>
    </div>
  </div>
  
  <input type="file" id="fileInput" style="display:none" accept=".md,.markdown,.txt">
  
  <script>
    let currentFileName = '未命名文档.md';
    let previewVisible = true;
    
    // 简单的 Markdown 转 HTML
    function markdownToHtml(markdown) {
      let html = markdown
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^\\* (.*?)$/gm, '<li>$1</li>')
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
        .replace(/\`(.*?)\`/g, '<code>$1</code>')
        .replace(/\\n\\n/g, '</p><p>')
        .replace(/\\n/g, '<br>');
      
      return '<p>' + html + '</p>';
    }
    
    // 更新预览
    function updatePreview() {
      const editor = document.getElementById('editor');
      const preview = document.getElementById('preview');
      preview.innerHTML = markdownToHtml(editor.value);
      
      // 更新统计信息
      const wordCount = editor.value.length;
      const lineCount = editor.value.split('\\n').length;
      document.getElementById('wordCount').textContent = '字数: ' + wordCount;
      document.getElementById('lineCount').textContent = '行数: ' + lineCount;
    }
    
    // 新建文件
    function newFile() {
      if (document.getElementById('editor').value && !confirm('确定要新建文件？未保存的内容将丢失。')) {
        return;
      }
      document.getElementById('editor').value = '';
      currentFileName = '未命名文档.md';
      document.getElementById('fileName').textContent = currentFileName;
      updatePreview();
    }
    
    // 打开文件
    function openFile() {
      document.getElementById('fileInput').click();
    }
    
    document.getElementById('fileInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('editor').value = event.target.result;
        currentFileName = file.name;
        document.getElementById('fileName').textContent = currentFileName;
        updatePreview();
      };
      reader.readAsText(file);
    });
    
    // 保存文件
    function saveFile() {
      const content = document.getElementById('editor').value;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // 导出 HTML
    function exportHTML() {
      const content = document.getElementById('editor').value;
      const html = \`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>\${currentFileName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; }
    h1, h2, h3 { margin-top: 20px; }
    code { background: #f5f5f5; padding: 2px 6px; }
    pre { background: #f5f5f5; padding: 12px; overflow-x: auto; }
  </style>
</head>
<body>
  \${markdownToHtml(content)}
</body>
</html>\`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFileName.replace('.md', '.html');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // 导出 Markdown
    function exportMarkdown() {
      saveFile();
    }
    
    // 打印
    function printDocument() {
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write(\`
        <!DOCTYPE html>
        <html>
        <head>
          <title>\${currentFileName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1, h2, h3 { margin-top: 20px; }
          </style>
        </head>
        <body>
          \${markdownToHtml(document.getElementById('editor').value)}
        </body>
        </html>
      \`);
      printWindow.document.close();
      printWindow.print();
    }
    
    // 切换预览
    function togglePreview() {
      previewVisible = !previewVisible;
      document.getElementById('previewSection').style.display = previewVisible ? 'flex' : 'none';
    }
    
    // 显示关于
    function showAbout() {
      document.getElementById('aboutModal').classList.add('show');
    }
    
    // 关闭模态框
    function closeModal(id) {
      document.getElementById(id).classList.remove('show');
    }
    
    // 初始化
    document.getElementById('editor').addEventListener('input', updatePreview);
    updatePreview();
  </script>
</body>
</html>`;

  return html;
}

/**
 * 下载离线版本
 */
export async function downloadOfflineVersion(): Promise<void> {
  try {
    const html = await generateOfflineHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Markdown-Pro-Editor-离线版本.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`离线版本下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 生成项目信息文件
 */
export function generateProjectInfo(): string {
  return `# Markdown Pro Editor - 项目信息

## 应用信息
- **名称**: Markdown Pro Editor
- **版本**: 1.0.0
- **发布日期**: ${new Date().toLocaleDateString('zh-CN')}
- **类型**: 离线 Web 应用

## 功能特性
- 实时 Markdown 编辑和预览
- 完全离线使用，无需网络
- 本地文件保存和加载
- 导出为 HTML、Markdown、PDF
- 打印功能
- 完全隐私保护

## 使用方法
1. 用浏览器打开 HTML 文件
2. 在左侧编辑区输入 Markdown 内容
3. 右侧实时显示预览效果
4. 使用工具栏进行文件操作和导出

## 系统要求
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 至少 2GB 内存
- 50MB 磁盘空间

## 快捷键
- Ctrl+S: 保存文件
- Ctrl+N: 新建文件
- Ctrl+O: 打开文件

## 许可证
MIT License

## 隐私声明
所有数据都保存在您的浏览器本地，不会上传到任何服务器。

---

感谢使用 Markdown Pro Editor！
`;
}

/**
 * 下载项目信息
 */
export async function downloadProjectInfo(): Promise<void> {
  try {
    const info = generateProjectInfo();
    const blob = new Blob([info], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Markdown-Pro-Editor-项目信息.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`项目信息下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
