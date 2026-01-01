import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export interface PrintSettings {
  paperSize: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  fontSize: number;
  lineHeight: number;
}

interface PrintSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PrintSettings;
  onSettingsChange: (settings: PrintSettings) => void;
  onPrint: () => void;
}

const paperSizes = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
};

export default function PrintSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onPrint,
}: PrintSettingsDialogProps) {
  const [tempSettings, setTempSettings] = useState(settings);

  const handleSettingChange = (key: keyof PrintSettings, value: any) => {
    setTempSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleConfirm = () => {
    onSettingsChange(tempSettings);
    onPrint();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>打印设置</DialogTitle>
          <DialogDescription>
            自定义打印参数以获得最佳的打印效果
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 纸张设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">纸张设置</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paper-size">纸张尺寸</Label>
                <Select
                  value={tempSettings.paperSize}
                  onValueChange={(value: any) =>
                    handleSettingChange('paperSize', value)
                  }
                >
                  <SelectTrigger id="paper-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210×297mm)</SelectItem>
                    <SelectItem value="A3">A3 (297×420mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5×11in)</SelectItem>
                    <SelectItem value="Legal">Legal (8.5×14in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">方向</Label>
                <Select
                  value={tempSettings.orientation}
                  onValueChange={(value: any) =>
                    handleSettingChange('orientation', value)
                  }
                >
                  <SelectTrigger id="orientation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">纵向</SelectItem>
                    <SelectItem value="landscape">横向</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 纸张尺寸预览 */}
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">纸张尺寸预览</p>
              <div className="flex justify-center">
                <div
                  className="bg-white border-2 border-border"
                  style={{
                    width: tempSettings.orientation === 'portrait' ? '80px' : '120px',
                    height: tempSettings.orientation === 'portrait' ? '120px' : '80px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 边距设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">边距 (mm)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="margin-top">上边距</Label>
                <Input
                  id="margin-top"
                  type="number"
                  min="0"
                  max="50"
                  value={tempSettings.marginTop}
                  onChange={(e) =>
                    handleSettingChange('marginTop', parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin-right">右边距</Label>
                <Input
                  id="margin-right"
                  type="number"
                  min="0"
                  max="50"
                  value={tempSettings.marginRight}
                  onChange={(e) =>
                    handleSettingChange('marginRight', parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin-bottom">下边距</Label>
                <Input
                  id="margin-bottom"
                  type="number"
                  min="0"
                  max="50"
                  value={tempSettings.marginBottom}
                  onChange={(e) =>
                    handleSettingChange('marginBottom', parseInt(e.target.value) || 0)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin-left">左边距</Label>
                <Input
                  id="margin-left"
                  type="number"
                  min="0"
                  max="50"
                  value={tempSettings.marginLeft}
                  onChange={(e) =>
                    handleSettingChange('marginLeft', parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          </div>

          {/* 文本设置 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">文本设置</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="font-size">字体大小 (pt)</Label>
                <Input
                  id="font-size"
                  type="number"
                  min="8"
                  max="24"
                  value={tempSettings.fontSize}
                  onChange={(e) =>
                    handleSettingChange('fontSize', parseInt(e.target.value) || 12)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="line-height">行高 (倍数)</Label>
                <Input
                  id="line-height"
                  type="number"
                  min="1"
                  max="3"
                  step="0.1"
                  value={tempSettings.lineHeight}
                  onChange={(e) =>
                    handleSettingChange('lineHeight', parseFloat(e.target.value) || 1.5)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleConfirm}>打印</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
