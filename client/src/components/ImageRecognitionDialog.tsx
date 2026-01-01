import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AIModelConfig } from '@/types/ai';
import {
  imageToBase64,
  recognizeImageWithAI,
  extractFormulasFromImage,
  extractTextFromImage,
} from '@/lib/imageRecognition';
import { Upload, Loader2, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageRecognitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelConfig: AIModelConfig | null;
  onInsertText?: (text: string) => void;
  onInsertFormula?: (formula: string) => void;
}

export default function ImageRecognitionDialog({
  open,
  onOpenChange,
  modelConfig,
  onInsertText,
  onInsertFormula,
}: ImageRecognitionDialogProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<{
    text: string;
    formulas: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    setImageFile(file);

    // 显示预览
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRecognize = async () => {
    if (!selectedImage || !imageFile || !modelConfig) {
      toast.error('请选择图片并配置 AI 模型');
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await imageToBase64(imageFile);
      const result = await recognizeImageWithAI(
        base64,
        modelConfig,
        imageFile.type.split('/')[1] as 'jpeg' | 'png' | 'webp'
      );

      setRecognitionResult({
        text: result.text,
        formulas: result.formulas.map((f) => f.latex),
      });

      toast.success('图片识别完成');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '识别失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractFormulas = async () => {
    if (!selectedImage || !imageFile || !modelConfig) {
      toast.error('请选择图片并配置 AI 模型');
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await imageToBase64(imageFile);
      const formulas = await extractFormulasFromImage(
        base64,
        modelConfig,
        imageFile.type.split('/')[1] as 'jpeg' | 'png' | 'webp'
      );

      setRecognitionResult({
        text: '',
        formulas: formulas.map((f) => f.latex),
      });

      toast.success('公式提取完成');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提取失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractText = async () => {
    if (!selectedImage || !imageFile || !modelConfig) {
      toast.error('请选择图片并配置 AI 模型');
      return;
    }

    setIsLoading(true);
    try {
      const base64 = await imageToBase64(imageFile);
      const text = await extractTextFromImage(
        base64,
        modelConfig,
        imageFile.type.split('/')[1] as 'jpeg' | 'png' | 'webp'
      );

      setRecognitionResult({
        text,
        formulas: [],
      });

      toast.success('文本提取完成');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '提取失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertText = () => {
    if (recognitionResult?.text && onInsertText) {
      onInsertText(recognitionResult.text);
      toast.success('文本已插入');
      onOpenChange(false);
    }
  };

  const handleInsertFormula = (formula: string) => {
    if (onInsertFormula) {
      onInsertFormula(`$${formula}$`);
      toast.success('公式已插入');
    }
  };

  const handleCopyText = () => {
    if (recognitionResult?.text) {
      navigator.clipboard.writeText(recognitionResult.text);
      toast.success('已复制到剪贴板');
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImageFile(null);
    setRecognitionResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>图片识别</DialogTitle>
          <DialogDescription>
            上传图片进行 OCR 识别和公式提取
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 上传区域 */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="预览"
                  className="max-w-full max-h-[300px] mx-auto rounded"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  更换图片
                </Button>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="font-medium">点击上传图片</p>
                <p className="text-sm text-muted-foreground">
                  支持 JPG、PNG、WebP 格式
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* 操作按钮 */}
          {selectedImage && !recognitionResult && (
            <div className="flex gap-2">
              <Button
                onClick={handleRecognize}
                disabled={isLoading || !modelConfig}
                className="flex-1"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                完整识别
              </Button>
              <Button
                variant="outline"
                onClick={handleExtractText}
                disabled={isLoading || !modelConfig}
                className="flex-1"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                提取文本
              </Button>
              <Button
                variant="outline"
                onClick={handleExtractFormulas}
                disabled={isLoading || !modelConfig}
                className="flex-1"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                提取公式
              </Button>
            </div>
          )}

          {!modelConfig && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              请先在 AI 助手中配置模型
            </div>
          )}

          {/* 识别结果 */}
          {recognitionResult && (
            <div className="space-y-4">
              {recognitionResult.text && (
                <Card className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">识别文本</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyText}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleInsertText}
                      >
                        插入
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {recognitionResult.text}
                  </p>
                </Card>
              )}

              {recognitionResult.formulas.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold text-sm mb-3">识别公式</h4>
                  <div className="space-y-2">
                    {recognitionResult.formulas.map((formula, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <code className="text-xs flex-1 break-all">
                          {formula}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInsertFormula(formula)}
                        >
                          插入
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRecognitionResult(null)}
                  className="flex-1"
                >
                  返回
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
