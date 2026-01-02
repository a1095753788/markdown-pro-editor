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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageManager, ImageData } from '@/lib/imageManager';
import { Upload, Trash2, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ImageInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertImage?: (markdown: string) => void;
}

export default function ImageInsertDialog({
  open,
  onOpenChange,
  onInsertImage,
}: ImageInsertDialogProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (open) {
      setImages(ImageManager.getAllImages());
    }
  }, [open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const imageData = await ImageManager.uploadImage(file);
      setImages([...images, imageData]);
      setSelectedImage(imageData);
      toast.success('图片上传成功');
    } catch (error) {
      toast.error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (id: string) => {
    ImageManager.deleteImage(id);
    setImages(images.filter((img) => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
    toast.success('图片已删除');
  };

  const handleInsertImage = () => {
    if (!selectedImage) {
      toast.error('请先选择图片');
      return;
    }

    const markdown = `![${altText || selectedImage.name}](${selectedImage.data})`;

    if (onInsertImage) {
      onInsertImage(markdown);
      onOpenChange(false);
      setAltText('');
      setSelectedImage(null);
    }
  };

  const handleDownloadImage = (image: ImageData) => {
    ImageManager.exportImage(image.id);
    toast.success('图片已下载');
  };

  const stats = ImageManager.getStorageStats();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>插入图片</DialogTitle>
          <DialogDescription>
            上传或选择图片插入到编辑器中
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">上传图片</TabsTrigger>
            <TabsTrigger value="gallery">图片库</TabsTrigger>
          </TabsList>

          {/* 上传标签页 */}
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="font-semibold">点击选择图片或拖拽上传</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    支持 JPG、PNG、GIF、WebP、SVG (最大 10MB)
                  </p>
                </div>
              </label>
            </div>

            {uploading && (
              <div className="text-center text-sm text-muted-foreground">
                上传中...
              </div>
            )}
          </TabsContent>

          {/* 图片库标签页 */}
          <TabsContent value="gallery" className="space-y-4">
            {/* 存储统计 */}
            <Card className="p-3 bg-muted/50">
              <div className="text-sm">
                <p className="font-semibold mb-2">存储统计</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">图片数量:</span>
                    <span className="ml-2 font-semibold">{stats.totalImages}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">总大小:</span>
                    <span className="ml-2 font-semibold">{stats.formattedSize}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* 图片列表 */}
            {images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                还没有上传任何图片
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                {images.map((img) => (
                  <Card
                    key={img.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedImage?.id === img.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary'
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <div className="aspect-square bg-muted rounded mb-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={img.data}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-xs font-medium truncate">{img.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {img.width}x{img.height}
                    </p>
                    <div className="flex gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(img);
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 flex-1 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 选中图片的详情和插入选项 */}
        {selectedImage && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="alt-text" className="text-sm font-semibold mb-2 block">
                替代文本 (Alt Text)
              </Label>
              <Input
                id="alt-text"
                placeholder="输入图片描述"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                用于无法加载图片时的显示，也有助于 SEO
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleInsertImage} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                插入图片
              </Button>
              <Button
                onClick={() => {
                  setSelectedImage(null);
                  setAltText('');
                }}
                variant="outline"
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
