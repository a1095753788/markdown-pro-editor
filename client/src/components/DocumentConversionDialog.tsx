import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, File, AlertCircle } from 'lucide-react';
import { convertFileToMarkdown, ConversionResult } from '@/lib/documentConverter';
import { toast } from 'sonner';

interface DocumentConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversionComplete?: (result: ConversionResult) => void;
}

export default function DocumentConversionDialog({
  open,
  onOpenChange,
  onConversionComplete,
}: DocumentConversionDialogProps) {
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setConverting(true);
    setProgress(0);

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const conversionResult = await convertFileToMarkdown(file);

      clearInterval(progressInterval);
      setProgress(100);
      setResult(conversionResult);

      toast.success(`文件转换成功: ${file.name}`);

      if (onConversionComplete) {
        onConversionComplete(conversionResult);
      }
    } catch (error) {
      toast.error(`转换失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setProgress(0);
    } finally {
      setConverting(false);
    }
  };

  const handleInsert = () => {
    if (result && onConversionComplete) {
      onConversionComplete(result);
      onOpenChange(false);
      setResult(null);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.markdown);
      toast.success('已复制到剪贴板');
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.fileName}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('文件已下载');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>文档转换为 Markdown</DialogTitle>
          <DialogDescription>
            支持 PDF、Word (.docx/.doc)、TXT 格式转换为 Markdown
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!result ? (
            <>
              {/* 上传区域 */}
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  disabled={converting}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">点击选择文件或拖拽上传</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      支持: PDF、Word、TXT
                    </p>
                  </div>
                </label>
              </div>

              {/* 进度条 */}
              {converting && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">转换中...</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* 格式说明 */}
              <Card className="p-4 bg-muted/50">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">支持的格式</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-red-500" />
                      <span>PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Word</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>TXT</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 注意事项 */}
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-semibold mb-1">转换提示</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>PDF 文件会按页面分割</li>
                      <li>Word 文件会保留格式和样式</li>
                      <li>TXT 文件会自动检测标题和列表</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* 转换结果 */}
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-900">转换成功</span>
                </div>
                <div className="text-sm text-green-900 space-y-1">
                  <p>
                    <span className="font-medium">文件名:</span> {result.fileName}
                  </p>
                  <p>
                    <span className="font-medium">格式:</span> {result.originalFormat.toUpperCase()}
                  </p>
                  {result.pageCount && (
                    <p>
                      <span className="font-medium">页数:</span> {result.pageCount}
                    </p>
                  )}
                  {result.wordCount && (
                    <p>
                      <span className="font-medium">字数:</span> {result.wordCount}
                    </p>
                  )}
                </div>
              </Card>

              {/* 预览 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold">转换结果预览</label>
                <div className="border rounded-lg p-4 bg-muted/50 max-h-[300px] overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words font-mono">
                    {result.markdown.substring(0, 500)}
                    {result.markdown.length > 500 && '...'}
                  </pre>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button onClick={handleInsert} className="flex-1">
                  插入编辑器
                </Button>
                <Button onClick={handleCopy} variant="outline" className="flex-1">
                  复制内容
                </Button>
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                  下载文件
                </Button>
              </div>

              {/* 重新转换 */}
              <Button
                onClick={() => {
                  setResult(null);
                  setProgress(0);
                }}
                variant="ghost"
                className="w-full"
              >
                转换其他文件
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
