import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';

export interface FormatOptions {
  headingSize: number;
  bodySize: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  textColor: string;
  backgroundColor: string;
}

interface FormatPanelProps {
  options: FormatOptions;
  onOptionsChange: (options: FormatOptions) => void;
}

export default function FormatPanel({ options, onOptionsChange }: FormatPanelProps) {
  const handleChange = (key: keyof FormatOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const fontFamilyMap = {
    serif: '-apple-system, BlinkMacSystemFont, "Georgia", serif',
    'sans-serif': '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Roboto Mono", "Courier New", monospace',
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          格式
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>格式编辑</SheetTitle>
          <SheetDescription>
            自定义文档的排版和样式
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* 字体设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">字体设置</h3>

            <div className="space-y-2">
              <Label htmlFor="font-family">字体族</Label>
              <Select
                value={options.fontFamily}
                onValueChange={(value: any) =>
                  handleChange('fontFamily', value)
                }
              >
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans-serif">无衬线 (现代)</SelectItem>
                  <SelectItem value="serif">衬线 (学术)</SelectItem>
                  <SelectItem value="mono">等宽 (代码)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heading-size">
                标题大小: {options.headingSize}px
              </Label>
              <Slider
                id="heading-size"
                min={20}
                max={48}
                step={1}
                value={[options.headingSize]}
                onValueChange={(value) =>
                  handleChange('headingSize', value[0])
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body-size">
                正文大小: {options.bodySize}px
              </Label>
              <Slider
                id="body-size"
                min={12}
                max={20}
                step={1}
                value={[options.bodySize]}
                onValueChange={(value) =>
                  handleChange('bodySize', value[0])
                }
              />
            </div>
          </div>

          {/* 行距和字间距 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">间距</h3>

            <div className="space-y-2">
              <Label htmlFor="line-height">
                行高: {options.lineHeight.toFixed(1)}
              </Label>
              <Slider
                id="line-height"
                min={1}
                max={2.5}
                step={0.1}
                value={[options.lineHeight]}
                onValueChange={(value) =>
                  handleChange('lineHeight', value[0])
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter-spacing">
                字间距: {options.letterSpacing}px
              </Label>
              <Slider
                id="letter-spacing"
                min={-2}
                max={4}
                step={0.5}
                value={[options.letterSpacing]}
                onValueChange={(value) =>
                  handleChange('letterSpacing', value[0])
                }
              />
            </div>
          </div>

          {/* 颜色设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">颜色</h3>

            <div className="space-y-2">
              <Label htmlFor="text-color">文本颜色</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={options.textColor}
                  onChange={(e) =>
                    handleChange('textColor', e.target.value)
                  }
                  className="w-12 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={options.textColor}
                  onChange={(e) =>
                    handleChange('textColor', e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bg-color">背景颜色</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={options.backgroundColor}
                  onChange={(e) =>
                    handleChange('backgroundColor', e.target.value)
                  }
                  className="w-12 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={options.backgroundColor}
                  onChange={(e) =>
                    handleChange('backgroundColor', e.target.value)
                  }
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 预览 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">预览</h3>
            <div
              className="p-4 rounded-lg border border-border"
              style={{
                fontFamily: fontFamilyMap[options.fontFamily],
                color: options.textColor,
                backgroundColor: options.backgroundColor,
                lineHeight: options.lineHeight,
                letterSpacing: `${options.letterSpacing}px`,
              }}
            >
              <h2 style={{ fontSize: `${options.headingSize}px` }} className="font-bold mb-2">
                标题示例
              </h2>
              <p style={{ fontSize: `${options.bodySize}px` }}>
                这是正文示例文本。您可以在这里预览格式设置的效果。
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
