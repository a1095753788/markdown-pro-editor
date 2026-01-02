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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  OfflineDownloadManager,
  DownloadProgress,
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
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const appInfo = OfflineDownloadManager.getAppInfo();

  const handleDownload = async () => {
    setDownloading(true);
    setProgress({
      current: 0,
      total: 100,
      percentage: 0,
      status: 'preparing',
      message: '准备下载...',
    });

    try {
      await OfflineDownloadManager.downloadOfflineVersion((prog) => {
        setProgress(prog);
      });

      toast.success('下载完成！');
      setTimeout(() => {
        setDownloading(false);
        setProgress(null);
      }, 2000);
    } catch (error) {
      toast.error(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setDownloading(false);
    }
  };

  const getProgressColor = () => {
    if (!progress) return 'bg-primary';
    switch (progress.status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>离线版本下载</DialogTitle>
          <DialogDescription>
            下载完整的应用代码和文件，支持离线使用
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="download" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="download">下载</TabsTrigger>
            <TabsTrigger value="info">应用信息</TabsTrigger>
            <TabsTrigger value="features">功能列表</TabsTrigger>
          </TabsList>

          {/* 下载标签页 */}
          <TabsContent value="download" className="space-y-4">
            {!downloading && !progress ? (
              <>
                {/* 应用信息卡片 */}
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">应用信息</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>
                        <span className="font-medium">应用名称:</span> {appInfo.name}
                      </p>
                      <p>
                        <span className="font-medium">版本:</span> {appInfo.version}
                      </p>
                      <p>
                        <span className="font-medium">发布日期:</span>{' '}
                        {new Date(appInfo.releaseDate).toLocaleDateString('zh-CN')}
                      </p>
                      <p>
                        <span className="font-medium">文件大小:</span> 约 50MB
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 包含内容 */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">包含内容</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>完整应用代码</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>所有依赖文件</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>详细文档</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>快速开始指南</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>公式库数据</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>试卷模板</span>
                    </div>
                  </div>
                </Card>

                {/* 系统要求 */}
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-amber-900">系统要求</h4>
                    <ul className="text-sm text-amber-800 list-disc list-inside space-y-1">
                      <li>现代浏览器 (Chrome、Firefox、Safari、Edge)</li>
                      <li>至少 2GB 内存</li>
                      <li>50MB 磁盘空间</li>
                      <li>Windows、Mac 或 Linux 系统</li>
                    </ul>
                  </div>
                </Card>

                {/* 下载按钮 */}
                <Button onClick={handleDownload} size="lg" className="w-full">
                  <Download className="w-5 h-5 mr-2" />
                  下载离线版本 (v{appInfo.version})
                </Button>

                {/* 说明 */}
                <Card className="p-4 bg-gray-50">
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>
                      <span className="font-semibold">下载后的使用方式:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>解压下载的文件</li>
                      <li>用浏览器打开 index.html 文件</li>
                      <li>开始使用应用</li>
                    </ol>
                    <p className="text-xs text-gray-500 mt-2">
                      所有数据都存储在本地，无需网络连接即可使用。
                    </p>
                  </div>
                </Card>
              </>
            ) : (
              <>
                {/* 下载进度 */}
                <Card className="p-6 text-center">
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold mb-2">
                        {progress?.message || '准备下载...'}
                      </p>
                      <Progress
                        value={progress?.percentage || 0}
                        className="h-3"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        {progress?.percentage || 0}%
                      </p>
                    </div>

                    {progress?.status === 'complete' && (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">下载完成！</span>
                      </div>
                    )}

                    {progress?.status === 'error' && (
                      <div className="flex items-center justify-center gap-2 text-destructive">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">下载失败</span>
                      </div>
                    )}
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* 应用信息标签页 */}
          <TabsContent value="info" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">应用名称:</span>
                  <p className="text-muted-foreground">{appInfo.name}</p>
                </div>
                <div>
                  <span className="font-semibold">描述:</span>
                  <p className="text-muted-foreground">{appInfo.description}</p>
                </div>
                <div>
                  <span className="font-semibold">版本:</span>
                  <p className="text-muted-foreground">{appInfo.version}</p>
                </div>
                <div>
                  <span className="font-semibold">作者:</span>
                  <p className="text-muted-foreground">{appInfo.author}</p>
                </div>
                <div>
                  <span className="font-semibold">许可证:</span>
                  <p className="text-muted-foreground">{appInfo.license}</p>
                </div>
                <div>
                  <span className="font-semibold">发布日期:</span>
                  <p className="text-muted-foreground">
                    {new Date(appInfo.releaseDate).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </Card>

            {/* 快速开始 */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">快速开始</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>下载并解压文件</li>
                <li>用浏览器打开 index.html</li>
                <li>开始创建和编辑文档</li>
                <li>所有数据自动保存到本地</li>
              </ol>
            </Card>
          </TabsContent>

          {/* 功能列表标签页 */}
          <TabsContent value="features" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-3">核心功能</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Markdown 编辑和预览</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>数学公式支持 (KaTeX)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>代码高亮</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>搜索和替换</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>撤销/重做</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>文档大纲导航</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>试卷排版</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>打印和导出</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>图片管理</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>题库管理</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>AI 对话</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>文件转换</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>主题切换</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>离线使用</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 关闭按钮 */}
        {!downloading && (
          <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">
            关闭
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
