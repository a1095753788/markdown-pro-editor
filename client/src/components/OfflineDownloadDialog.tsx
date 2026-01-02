import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  downloadOfflineVersion,
  downloadProjectInfo,
  generateProjectInfo,
} from '@/lib/offlineDownload';
import { Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OfflineDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OfflineDownloadDialog({
  open,
  onOpenChange,
}: OfflineDownloadDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadOffline = async () => {
    setDownloading(true);
    try {
      // 下载完整的离线包（ZIP 文件）
      const response = await fetch('/offline-package.zip');
      if (!response.ok) {
        throw new Error('离线包下载失败');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Markdown-Pro-Editor-完整离线版本.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('离线版本下载完成！请解压后用浏览器打开 index.html');
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadProjectInfo = async () => {
    setDownloading(true);
    try {
      await downloadProjectInfo();
      toast.success('项目信息下载完成！');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyProjectInfo = async () => {
    try {
      const info = generateProjectInfo();
      await navigator.clipboard.writeText(info);
      toast.success('项目信息已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>离线版本下载</DialogTitle>
          <DialogDescription>
            下载完整的应用代码和文件，支持完全离线使用
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="offline" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offline">离线版本</TabsTrigger>
            <TabsTrigger value="info">项目信息</TabsTrigger>
          </TabsList>

          <TabsContent value="offline" className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">完全离线版本</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    包含完整的应用代码，可直接在浏览器中打开使用，无需任何依赖。
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">功能特性</h4>
                <ul className="space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>完全离线使用，无需网络连接</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>实时 Markdown 编辑和预览</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>本地文件保存和加载</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>导出为 HTML、Markdown、PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>打印功能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>完全隐私保护</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">使用方法</h4>
                <ol className="space-y-1 text-sm list-decimal list-inside">
                  <li>下载 HTML 文件到本地</li>
                  <li>用浏览器打开该文件</li>
                  <li>开始编辑和使用应用</li>
                  <li>所有数据都保存在浏览器本地</li>
                </ol>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleDownloadOffline}
                disabled={downloading}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? '下载中...' : '下载完整离线包 (6.3MB)'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                包含所有功能，完全离线使用，无需任何依赖
              </p>
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex gap-3">
                <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">项目信息</h3>
                  <p className="text-sm text-green-800 mt-1">
                    包含应用的完整信息、功能说明和使用指南。
                  </p>
                </div>
              </div>
            </Card>

            <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-64 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-mono">
                {generateProjectInfo()}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDownloadProjectInfo}
                disabled={downloading}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                下载为 Markdown
              </Button>
              <Button
                onClick={handleCopyProjectInfo}
                disabled={downloading}
                variant="outline"
                className="flex-1"
              >
                复制内容
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            离线版本是一个完整的 HTML 文件，可以在任何浏览器中打开。所有数据都保存在本地，完全隐私保护。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
