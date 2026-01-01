/**
 * 文件管理系统 - 支持本地存储、导出、备份和恢复
 */

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  size: number;
  backups: BackupRecord[];
}

export interface BackupRecord {
  timestamp: number;
  content: string;
  version: number;
}

const MAX_BACKUPS = 10;
const STORAGE_PREFIX = 'markdown-editor-';

/**
 * 获取本地存储的所有文件
 */
export function getAllFiles(): FileMetadata[] {
  const files: FileMetadata[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX + 'file-')) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          files.push(JSON.parse(data));
        } catch (error) {
          console.error('解析文件数据失败:', error);
        }
      }
    }
  }
  return files.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * 获取单个文件
 */
export function getFile(fileId: string): FileMetadata | null {
  const key = `${STORAGE_PREFIX}file-${fileId}`;
  const data = localStorage.getItem(key);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('解析文件数据失败:', error);
    return null;
  }
}

/**
 * 保存文件
 */
export function saveFile(
  fileName: string,
  content: string,
  fileId?: string
): FileMetadata {
  const id = fileId || `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const file: FileMetadata = {
    id,
    name: fileName,
    path: `/documents/${fileName}`,
    content,
    createdAt: fileId ? getFile(id)?.createdAt || now : now,
    updatedAt: now,
    size: new Blob([content]).size,
    backups: [],
  };

  // 如果文件已存在，保留旧备份
  const existingFile = getFile(id);
  if (existingFile && existingFile.backups.length > 0) {
    file.backups = existingFile.backups;
  }

  // 添加新备份
  if (existingFile && existingFile.content !== content) {
    file.backups.unshift({
      timestamp: existingFile.updatedAt,
      content: existingFile.content,
      version: (file.backups[0]?.version || 0) + 1,
    });

    // 只保留最新的 10 个备份
    if (file.backups.length > MAX_BACKUPS) {
      file.backups = file.backups.slice(0, MAX_BACKUPS);
    }
  }

  const key = `${STORAGE_PREFIX}file-${id}`;
  localStorage.setItem(key, JSON.stringify(file));

  return file;
}

/**
 * 删除文件
 */
export function deleteFile(fileId: string): boolean {
  const key = `${STORAGE_PREFIX}file-${fileId}`;
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    return true;
  }
  return false;
}

/**
 * 获取文件备份列表
 */
export function getFileBackups(fileId: string): BackupRecord[] {
  const file = getFile(fileId);
  return file?.backups || [];
}

/**
 * 恢复文件到指定备份版本
 */
export function restoreFileBackup(fileId: string, backupIndex: number): FileMetadata | null {
  const file = getFile(fileId);
  if (!file || !file.backups[backupIndex]) {
    return null;
  }

  const backup = file.backups[backupIndex];
  const newFile = saveFile(file.name, backup.content, fileId);

  return newFile;
}

/**
 * 删除指定备份
 */
export function deleteBackup(fileId: string, backupIndex: number): boolean {
  const file = getFile(fileId);
  if (!file || !file.backups[backupIndex]) {
    return false;
  }

  file.backups.splice(backupIndex, 1);
  const key = `${STORAGE_PREFIX}file-${fileId}`;
  localStorage.setItem(key, JSON.stringify(file));

  return true;
}

/**
 * 导出文件为 JSON（包含备份）
 */
export function exportFileAsJSON(fileId: string): string | null {
  const file = getFile(fileId);
  if (!file) return null;

  return JSON.stringify(file, null, 2);
}

/**
 * 导出文件为 Markdown
 */
export function exportFileAsMarkdown(fileId: string): string | null {
  const file = getFile(fileId);
  if (!file) return null;

  return file.content;
}

/**
 * 导出文件为纯文本
 */
export function exportFileAsText(fileId: string): string | null {
  const file = getFile(fileId);
  if (!file) return null;

  return file.content;
}

/**
 * 导出文件为 HTML
 */
export function exportFileAsHTML(fileId: string, htmlContent: string): string | null {
  const file = getFile(fileId);
  if (!file) return null;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: "Monaco", "Courier New", monospace;
    }
    pre {
      background-color: #f4f4f4;
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 0;
      padding-left: 16px;
      color: #666;
    }
  </style>
</head>
<body>
  ${htmlContent}
  <hr>
  <footer style="color: #999; font-size: 12px; margin-top: 40px;">
    <p>文件名: ${file.name}</p>
    <p>创建时间: ${new Date(file.createdAt).toLocaleString('zh-CN')}</p>
    <p>最后修改: ${new Date(file.updatedAt).toLocaleString('zh-CN')}</p>
  </footer>
</body>
</html>`;
}

/**
 * 导出文件为 PDF（需要调用外部 PDF 生成）
 */
export function exportFileMetadata(fileId: string): FileMetadata | null {
  return getFile(fileId);
}

/**
 * 导入文件（从 JSON）
 */
export function importFileFromJSON(jsonData: string): FileMetadata | null {
  try {
    const file = JSON.parse(jsonData) as FileMetadata;
    if (!file.id || !file.name || !file.content) {
      throw new Error('无效的文件格式');
    }

    // 生成新的 ID 避免冲突
    const newId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    file.id = newId;
    file.createdAt = Date.now();
    file.updatedAt = Date.now();

    const key = `${STORAGE_PREFIX}file-${newId}`;
    localStorage.setItem(key, JSON.stringify(file));

    return file;
  } catch (error) {
    console.error('导入文件失败:', error);
    return null;
  }
}

/**
 * 导出所有文件为 ZIP（返回 JSON 数组）
 */
export function exportAllFilesAsJSON(): string {
  const files = getAllFiles();
  return JSON.stringify(files, null, 2);
}

/**
 * 导入所有文件（从 JSON 数组）
 */
export function importAllFilesFromJSON(jsonData: string): FileMetadata[] {
  try {
    const files = JSON.parse(jsonData) as FileMetadata[];
    const imported: FileMetadata[] = [];

    for (const file of files) {
      if (!file.id || !file.name || !file.content) {
        continue;
      }

      // 生成新的 ID 避免冲突
      const newId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      file.id = newId;
      file.createdAt = Date.now();
      file.updatedAt = Date.now();

      const key = `${STORAGE_PREFIX}file-${newId}`;
      localStorage.setItem(key, JSON.stringify(file));

      imported.push(file);
    }

    return imported;
  } catch (error) {
    console.error('导入文件失败:', error);
    return [];
  }
}

/**
 * 清空所有数据
 */
export function clearAllData(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }

  keys.forEach((key) => localStorage.removeItem(key));
}

/**
 * 获取存储统计信息
 */
export function getStorageStats(): {
  fileCount: number;
  totalSize: number;
  backupCount: number;
} {
  const files = getAllFiles();
  let totalSize = 0;
  let backupCount = 0;

  files.forEach((file) => {
    totalSize += file.size;
    backupCount += file.backups.length;
  });

  return {
    fileCount: files.length,
    totalSize,
    backupCount,
  };
}

/**
 * 下载文件到本地
 */
export function downloadFile(content: string, fileName: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 下载文件夹（模拟）- 返回可下载的文件列表
 */
export function downloadFolder(folderName: string): void {
  const files = getAllFiles();
  const folderData = {
    name: folderName,
    createdAt: new Date().toISOString(),
    files: files.map((file) => ({
      name: file.name,
      content: file.content,
      metadata: {
        createdAt: new Date(file.createdAt).toISOString(),
        updatedAt: new Date(file.updatedAt).toISOString(),
        size: file.size,
      },
    })),
  };

  const content = JSON.stringify(folderData, null, 2);
  downloadFile(content, `${folderName}-${Date.now()}.json`, 'application/json');
}

/**
 * 从文件夹导入（从 JSON）
 */
export function importFolder(jsonData: string): FileMetadata[] {
  try {
    const folderData = JSON.parse(jsonData);
    if (!Array.isArray(folderData.files)) {
      throw new Error('无效的文件夹格式');
    }

    const imported: FileMetadata[] = [];
    for (const fileData of folderData.files) {
      const newId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const file: FileMetadata = {
        id: newId,
        name: fileData.name,
        path: `/documents/${fileData.name}`,
        content: fileData.content,
        createdAt: new Date(fileData.metadata?.createdAt || Date.now()).getTime(),
        updatedAt: new Date(fileData.metadata?.updatedAt || Date.now()).getTime(),
        size: fileData.metadata?.size || new Blob([fileData.content]).size,
        backups: [],
      };

      const key = `${STORAGE_PREFIX}file-${newId}`;
      localStorage.setItem(key, JSON.stringify(file));
      imported.push(file);
    }

    return imported;
  } catch (error) {
    console.error('导入文件夹失败:', error);
    return [];
  }
}
