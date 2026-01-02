/**
 * 图片管理服务
 * 支持图片上传、存储和插入编辑器
 */

export interface ImageData {
  id: string;
  name: string;
  data: string; // Base64 编码
  size: number;
  type: string;
  uploadedAt: Date;
  width?: number;
  height?: number;
}

/**
 * 图片存储管理
 */
export class ImageManager {
  private static readonly STORAGE_KEY = 'markdown-editor-images';
  private static readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * 上传图片
   */
  static async uploadImage(file: File): Promise<ImageData> {
    // 验证文件大小
    if (file.size > this.MAX_IMAGE_SIZE) {
      throw new Error(`图片大小超过限制 (最大 10MB)`);
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`不支持的图片格式: ${file.type}`);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = event.target?.result as string;

        // 获取图片尺寸
        const img = new Image();
        img.onload = () => {
          const imageData: ImageData = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            data,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            width: img.width,
            height: img.height,
          };

          // 保存到本地存储
          this.saveImage(imageData);
          resolve(imageData);
        };

        img.onerror = () => {
          reject(new Error('图片加载失败'));
        };

        img.src = data;
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 保存图片到本地存储
   */
  private static saveImage(imageData: ImageData): void {
    const images = this.getAllImages();
    images.push(imageData);

    // 限制存储的图片数量（最多 100 张）
    if (images.length > 100) {
      images.shift();
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  }

  /**
   * 获取所有图片
   */
  static getAllImages(): ImageData[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 获取单个图片
   */
  static getImage(id: string): ImageData | undefined {
    return this.getAllImages().find((img) => img.id === id);
  }

  /**
   * 删除图片
   */
  static deleteImage(id: string): void {
    const images = this.getAllImages();
    const filtered = images.filter((img) => img.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * 清空所有图片
   */
  static clearAllImages(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * 生成 Markdown 图片语法
   */
  static generateMarkdownImage(imageId: string, alt: string = ''): string {
    const image = this.getImage(imageId);
    if (!image) return '';

    return `![${alt}](${image.data})`;
  }

  /**
   * 导出图片
   */
  static exportImage(imageId: string): void {
    const image = this.getImage(imageId);
    if (!image) return;

    const link = document.createElement('a');
    link.href = image.data;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 获取存储统计信息
   */
  static getStorageStats(): {
    totalImages: number;
    totalSize: number;
    formattedSize: string;
  } {
    const images = this.getAllImages();
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);

    return {
      totalImages: images.length,
      totalSize,
      formattedSize: this.formatBytes(totalSize),
    };
  }

  /**
   * 格式化字节大小
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * 从 Markdown 中提取图片
 */
export function extractImagesFromMarkdown(markdown: string): Array<{ alt: string; src: string }> {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const images: Array<{ alt: string; src: string }> = [];

  let match;
  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      alt: match[1],
      src: match[2],
    });
  }

  return images;
}

/**
 * 替换 Markdown 中的图片 ID 为实际数据
 */
export function resolveMarkdownImages(markdown: string): string {
  const imageIdRegex = /!\[([^\]]*)\]\(img-[^\)]+\)/g;

  return markdown.replace(imageIdRegex, (match, alt) => {
    const imageId = match.match(/\(([^)]+)\)/)?.[1];
    if (imageId) {
      const image = ImageManager.getImage(imageId);
      if (image) {
        return `![${alt}](${image.data})`;
      }
    }
    return match;
  });
}
