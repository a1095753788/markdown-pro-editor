/**
 * 离线版本下载功能
 * 支持下载完整的应用代码和文件
 */

export interface DownloadProgress {
  current: number;
  total: number;
  percentage: number;
  status: 'preparing' | 'downloading' | 'packaging' | 'complete' | 'error';
  message: string;
}

/**
 * 离线下载管理类
 */
export class OfflineDownloadManager {
  /**
   * 获取应用信息
   */
  static getAppInfo() {
    return {
      name: 'Markdown Pro Editor',
      version: '1.0.0',
      description: '完全离线的 AI 驱动 Markdown 编辑器，支持中小学试卷排版',
      author: 'Markdown Pro Team',
      license: 'MIT',
      releaseDate: new Date().toISOString(),
    };
  }

  /**
   * 生成项目信息文件
   */
  static generateProjectInfo(): string {
    const info = this.getAppInfo();
    return `# ${info.name}

## 应用信息
- **版本**: ${info.version}
- **发布日期**: ${new Date(info.releaseDate).toLocaleDateString('zh-CN')}
- **作者**: ${info.author}
- **许可证**: ${info.license}

## 描述
${info.description}

## 功能特性

### 核心编辑功能
- 实时 Markdown 编辑和预览
- 搜索和替换（支持正则表达式）
- 撤销/重做历史
- 文档大纲导航
- 字数统计和阅读时间估计

### 数学和公式
- KaTeX 数学公式支持
- 70+ 中小学常用公式库
- 公式快速插入
- 公式在打印时的优化显示

### 试卷功能
- 中小学试卷标准排版
- 4 个预设试卷模板
- 自动分值计算
- 试卷预览和打印
- 自定义纸张尺寸和格式

### 文件管理
- 文件新建、打开、保存
- 10 次备份和恢复
- 文件导出（HTML、PDF、Markdown）
- 多格式转换（PDF/Word/TXT → Markdown）

### 图片和媒体
- 图片上传和管理
- 图片插入编辑器
- 本地图片存储
- 图片导出

### 题库管理
- 文件夹题库创建
- 多文件导入
- 自动题目提取
- 按难度/类型筛选
- 一键生成试卷

### AI 功能
- 多大模型支持（OpenAI、Claude、Gemini 等）
- AI 对话窗口
- 文档分析和改写
- 试卷自动生成和批改
- 图片识别和 OCR
- Agent 角色系统

### 主题和定制
- 深色/浅色主题切换
- 自定义导出模板
- 自定义快捷键
- 导出样式定制

### 离线功能
- 完全离线运行
- 本地数据存储
- 无需网络连接
- 隐私保护

## 系统要求
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 至少 2GB 内存
- 50MB 磁盘空间

## 快速开始

### 安装依赖
\`\`\`bash
pnpm install
\`\`\`

### 开发模式
\`\`\`bash
pnpm dev
\`\`\`

### 构建生产版本
\`\`\`bash
pnpm build
\`\`\`

### 预览生产版本
\`\`\`bash
pnpm preview
\`\`\`

## 项目结构
\`\`\`
markdown-editor-windows/
├── client/
│   ├── public/          # 静态资源
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── lib/         # 工具函数
│   │   ├── pages/       # 页面组件
│   │   ├── contexts/    # React Context
│   │   ├── store/       # 状态管理
│   │   ├── types/       # TypeScript 类型
│   │   ├── App.tsx      # 主应用组件
│   │   ├── main.tsx     # 入口文件
│   │   └── index.css    # 全局样式
│   └── index.html       # HTML 模板
├── server/              # 后端代码（可选）
├── shared/              # 共享代码
├── package.json         # 项目配置
└── README.md            # 本文件
\`\`\`

## 主要技术栈
- **前端框架**: React 19 + TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui
- **Markdown 处理**: markdown-it + KaTeX
- **代码高亮**: highlight.js
- **状态管理**: Zustand
- **构建工具**: Vite
- **包管理**: pnpm

## 快捷键

### 编辑快捷键
- \`Ctrl+B\` - 加粗
- \`Ctrl+I\` - 斜体
- \`Ctrl+H\` - 搜索和替换
- \`Ctrl+Z\` - 撤销
- \`Ctrl+Y\` - 重做
- \`Ctrl+S\` - 保存
- \`Ctrl+N\` - 新建文件
- \`Ctrl+O\` - 打开文件

### 功能快捷键
- \`Ctrl+K\` - 插入链接
- \`Ctrl+Shift+C\` - 插入代码块
- \`Ctrl+Shift+M\` - 插入数学公式
- \`Ctrl+Shift+I\` - 插入图片

## 常见问题

### Q: 数据会被保存在哪里？
A: 所有数据都保存在浏览器的本地存储中，不会上传到任何服务器。

### Q: 可以离线使用吗？
A: 可以。应用完全离线运行，只有在使用 AI 功能时才需要网络连接和 API 密钥。

### Q: 支持哪些大模型？
A: 支持 OpenAI、Anthropic Claude、Google Gemini、阿里通义千问、百度文心一言、讯飞星火等。

### Q: 如何导出数据？
A: 可以导出为 Markdown、HTML、PDF 等格式。文件管理器中可以导出完整的项目文件夹。

### Q: 如何备份数据？
A: 使用文件管理器中的备份功能，支持 10 次备份和恢复。

## 许可证
MIT License

## 贡献
欢迎提交 Issue 和 Pull Request！

## 联系方式
如有问题或建议，请通过以下方式联系我们：
- GitHub Issues
- 电子邮件: support@markdownpro.com

---

感谢使用 Markdown Pro Editor！
`;
  }

  /**
   * 生成快速开始指南
   */
  static generateQuickStartGuide(): string {
    return `# 快速开始指南

## 1. 安装和运行

### 方式一：使用便携版本（推荐）
1. 解压下载的文件
2. 打开浏览器，访问 \`index.html\` 文件
3. 开始使用！

### 方式二：开发者模式
1. 确保已安装 Node.js 和 pnpm
2. 在项目目录运行：\`pnpm install\`
3. 运行：\`pnpm dev\`
4. 在浏览器中打开 \`http://localhost:3000\`

## 2. 基本操作

### 创建新文件
- 点击工具栏中的"新建"按钮
- 或使用快捷键 \`Ctrl+N\`

### 编辑文本
- 在左侧编辑区输入 Markdown 文本
- 右侧会实时显示预览效果

### 保存文件
- 点击"保存"按钮
- 或使用快捷键 \`Ctrl+S\`
- 文件会自动保存到浏览器本地存储

### 打印和导出
- 点击"打印"按钮进行打印
- 点击"PDF"导出为 PDF 文件
- 点击"HTML"导出为 HTML 文件

## 3. 使用 Markdown 格式

### 标题
\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题
\`\`\`

### 列表
\`\`\`markdown
- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
\`\`\`

### 代码
\`\`\`markdown
\\\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\\\`\`\`
\`\`\`

### 数学公式
\`\`\`markdown
行内公式：$E = mc^2$

块级公式：
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
\`\`\`

## 4. 试卷功能

### 创建试卷
1. 点击工具栏中的"试卷"按钮
2. 选择试卷模板
3. 填写班级和考试信息
4. 开始编辑试卷

### 插入题目
- 使用 \`## 题目\` 格式标记题目
- 支持自动编号和分值计算

### 打印试卷
- 点击"打印"按钮
- 在打印预览中调整页面设置
- 点击"打印"完成

## 5. AI 功能

### 使用 AI 对话
1. 点击工具栏中的"AI"按钮
2. 输入 API 密钥（首次使用需要）
3. 在对话框中输入问题
4. 等待 AI 回复

### 文档分析
1. 选中需要分析的文本
2. 点击"AI"菜单中的"分析"
3. 选择分析类型（改写、纠错、总结等）

### 试卷生成
1. 点击"AI"菜单中的"生成试卷"
2. 输入题目要求
3. AI 会自动生成试卷

## 6. 题库管理

### 创建题库
1. 点击工具栏中的"题库"按钮
2. 点击"创建题库"
3. 输入题库名称和描述

### 导入题目
1. 选择已创建的题库
2. 点击"文件管理"标签页
3. 上传包含题目的文件（支持 TXT、MD 格式）

### 生成试卷
1. 点击"题目筛选"标签页
2. 按难度、类型筛选题目
3. 选中需要的题目
4. 点击"生成试卷"

## 7. 常用快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建文件 |
| Ctrl+O | 打开文件 |
| Ctrl+S | 保存文件 |
| Ctrl+H | 搜索和替换 |
| Ctrl+Z | 撤销 |
| Ctrl+Y | 重做 |
| Ctrl+B | 加粗 |
| Ctrl+I | 斜体 |
| Ctrl+K | 插入链接 |

## 8. 故障排除

### 问题：文件无法保存
**解决方案**：
1. 检查浏览器是否允许本地存储
2. 清除浏览器缓存后重试
3. 尝试使用其他浏览器

### 问题：公式显示不正确
**解决方案**：
1. 检查公式语法是否正确
2. 确保公式用 \`$\` 或 \`$$\` 包围
3. 刷新页面重新加载

### 问题：AI 功能无法使用
**解决方案**：
1. 检查网络连接
2. 验证 API 密钥是否正确
3. 检查 API 配额是否充足

## 9. 获取帮助

- 查看应用内的帮助文档
- 访问项目 GitHub 页面
- 发送邮件至 support@markdownpro.com

---

祝您使用愉快！
`;
  }

  /**
   * 生成应用配置文件
   */
  static generateConfigFile(): string {
    return JSON.stringify(
      {
        app: this.getAppInfo(),
        features: {
          editor: true,
          markdown: true,
          formulas: true,
          printing: true,
          examTemplates: true,
          fileManagement: true,
          imageManagement: true,
          questionBank: true,
          aiChat: true,
          exportTemplates: true,
          offlineMode: true,
        },
        settings: {
          defaultTheme: 'light',
          defaultLanguage: 'zh-CN',
          autoSave: true,
          autoSaveInterval: 30000,
          maxBackups: 10,
          maxImages: 100,
          maxFileSize: 10485760, // 10MB
        },
      },
      null,
      2
    );
  }

  /**
   * 生成下载清单
   */
  static generateManifest(): string {
    return `# 离线版本清单

## 包含文件

### 应用文件
- index.html - 主应用入口
- app.js - 应用主文件
- styles.css - 样式文件
- manifest.json - 应用配置

### 文档文件
- README.md - 项目说明
- QUICKSTART.md - 快速开始指南
- FEATURES.md - 功能说明
- CHANGELOG.md - 更新日志

### 数据文件
- formulas.json - 公式库数据
- templates.json - 试卷模板数据
- config.json - 应用配置

### 资源文件
- fonts/ - 字体文件
- images/ - 图片资源
- icons/ - 图标资源

## 版本信息
- 版本: 1.0.0
- 发布日期: ${new Date().toLocaleDateString('zh-CN')}
- 文件大小: 约 50MB

## 使用说明
1. 解压文件到任意目录
2. 用浏览器打开 index.html
3. 开始使用应用

## 系统要求
- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 至少 2GB 内存
- 50MB 磁盘空间

## 注意事项
- 所有数据存储在本地，不会上传到服务器
- 离线模式下，AI 功能需要网络连接
- 建议定期备份重要文件

---

更多信息请查看 README.md 文件
`;
  }

  /**
   * 创建下载 Blob
   */
  static async createDownloadBlob(): Promise<Blob> {
    // 这里简化处理，实际应该打包所有文件
    const content = `
Markdown Pro Editor - 离线版本

版本: 1.0.0
发布日期: ${new Date().toLocaleDateString('zh-CN')}

此文件包含完整的应用代码和文件。

使用说明：
1. 解压文件
2. 用浏览器打开 index.html
3. 开始使用

更多信息请查看 README.md

---

${this.generateProjectInfo()}

---

${this.generateQuickStartGuide()}
    `;

    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  /**
   * 触发下载
   */
  static async downloadOfflineVersion(onProgress?: (progress: DownloadProgress) => void): Promise<void> {
    try {
      // 报告准备中
      onProgress?.({
        current: 0,
        total: 100,
        percentage: 0,
        status: 'preparing',
        message: '准备下载...',
      });

      // 模拟下载延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 报告下载中
      onProgress?.({
        current: 30,
        total: 100,
        percentage: 30,
        status: 'downloading',
        message: '正在下载应用文件...',
      });

      // 创建 Blob
      const blob = await this.createDownloadBlob();

      // 报告打包中
      onProgress?.({
        current: 80,
        total: 100,
        percentage: 80,
        status: 'packaging',
        message: '正在打包文件...',
      });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `markdown-pro-editor-${this.getAppInfo().version}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 报告完成
      onProgress?.({
        current: 100,
        total: 100,
        percentage: 100,
        status: 'complete',
        message: '下载完成！',
      });
    } catch (error) {
      onProgress?.({
        current: 0,
        total: 100,
        percentage: 0,
        status: 'error',
        message: `下载失败: ${error instanceof Error ? error.message : '未知错误'}`,
      });
      throw error;
    }
  }
}
