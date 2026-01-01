import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAllFiles,
  getFile,
  deleteFile,
  getFileBackups,
  restoreFileBackup,
  downloadFile,
  exportAllFilesAsJSON,
  importAllFilesFromJSON,
  getStorageStats,
  FileMetadata,
} from '@/lib/fileManager';
import { Download, Trash2, RotateCcw, Upload, FolderDown, FolderUp } from 'lucide-react';
import { toast } from 'sonner';

interface FileManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect?: (file: FileMetadata) => void;
}

export default function FileManagerDialog({
  open,
  onOpenChange,
  onFileSelect,
}: FileManagerDialogProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [stats, setStats] = useState({ fileCount: 0, totalSize: 0, backupCount: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadFiles();
    }
  }, [open]);

  const loadFiles = () => {
    const allFiles = getAllFiles();
    setFiles(allFiles);
    setStats(getStorageStats());
  };

  const handleSelectFile = (file: FileMetadata) => {
    setSelectedFileId(file.id);
    const fileBackups = getFileBackups(file.id);
    setBackups(fileBackups);
  };

  const handleDeleteFile = (fileId: string) => {
    if (confirm('确定要删除这个文件吗？')) {
      if (deleteFile(fileId)) {
        toast.success('文件已删除');
        loadFiles();
        if (selectedFileId === fileId) {
          setSelectedFileId(null);
          setBackups([]);
        }
      }
    }
  };

  const handleRestoreBackup = (backupIndex: number) => {
    if (selectedFileId && confirm('确定要恢复到这个版本吗？')) {
      const restored = restoreFileBackup(selectedFileId, backupIndex);
      if (restored) {
        toast.success('已恢复到指定版本');
        loadFiles();
        handleSelectFile(restored);
      }
    }
  };

  const handleDownloadFile = (fileId: string) => {
    const file = getFile(fileId);
    if (file) {
      downloadFile(file.content, file.name, 'text/markdown');
      toast.success('文件已下载');
    }
  };

  const handleExportAll = () => {
    const json = exportAllFilesAsJSON();
    downloadFile(json, `markdown-editor-backup-${Date.now()}.json`, 'application/json');
    toast.success('所有文件已导出');
  };

  const handleImportFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const imported = importAllFilesFromJSON(content);
        if (imported.length > 0) {
          toast.success(`已导入 ${imported.length} 个文件`);
          loadFiles();
        } else {
          toast.error('导入失败，文件格式不正确');
        }
      } catch (error) {
        toast.error('导入失败');
      }
    };
    reader.readAsText(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>文件管理</DialogTitle>
          <DialogDescription>
            管理您的 Markdown 文件、备份和导出
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">文件数量</div>
              <div className="text-2xl font-bold">{stats.fileCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">总大小</div>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">备份数</div>
              <div className="text-2xl font-bold">{stats.backupCount}</div>
            </Card>
          </div>

          {/* 标签页 */}
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">文件列表</TabsTrigger>
              <TabsTrigger value="backups">备份管理</TabsTrigger>
            </TabsList>

            {/* 文件列表 */}
            <TabsContent value="files" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handleExportAll}
                  variant="outline"
                  className="flex-1"
                >
                  <FolderDown className="w-4 h-4 mr-2" />
                  导出所有文件
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <FolderUp className="w-4 h-4 mr-2" />
                  导入文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFiles}
                  className="hidden"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {files.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    没有文件
                  </div>
                ) : (
                  files.map((file) => (
                    <Card
                      key={file.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedFileId === file.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSelectFile(file)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{file.name}</h4>
                          <div className="text-sm text-muted-foreground mt-1">
                            <p>大小: {formatFileSize(file.size)}</p>
                            <p>创建: {formatDate(file.createdAt)}</p>
                            <p>修改: {formatDate(file.updatedAt)}</p>
                            <p>备份: {file.backups.length} 个</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(file.id);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* 备份管理 */}
            <TabsContent value="backups" className="space-y-4">
              {selectedFileId && backups.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {backups.map((backup, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">版本 {backup.version}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(backup.timestamp)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(new Blob([backup.content]).size)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreBackup(index)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          恢复
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {selectedFileId ? '没有备份' : '请先选择一个文件'}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
