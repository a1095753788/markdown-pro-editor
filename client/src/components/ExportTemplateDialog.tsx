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
import {
  ExportTemplateManager,
  ExportTemplate,
  ExportSettings,
  DEFAULT_EXPORT_SETTINGS,
} from '@/lib/exportTemplates';
import { Download, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ExportTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport?: (template: ExportTemplate, content: string) => void;
  content?: string;
}

export default function ExportTemplateDialog({
  open,
  onOpenChange,
  onExport,
  content = '',
}: ExportTemplateDialogProps) {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate | null>(null);
  const [editingSettings, setEditingSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [templateName, setTemplateName] = useState('');

  React.useEffect(() => {
    if (open) {
      const allTemplates = ExportTemplateManager.getAllTemplates();
      setTemplates(allTemplates);
      setSelectedTemplate(allTemplates[0]);
      setEditingSettings(allTemplates[0]?.settings || DEFAULT_EXPORT_SETTINGS);
    }
  }, [open]);

  const handleSelectTemplate = (template: ExportTemplate) => {
    setSelectedTemplate(template);
    setEditingSettings(template.settings);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('请输入模板名称');
      return;
    }

    const newTemplate: ExportTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      description: '自定义模板',
      format: 'pdf',
      settings: editingSettings,
      createdAt: new Date(),
    };

    ExportTemplateManager.saveTemplate(newTemplate);
    setTemplates(ExportTemplateManager.getAllTemplates());
    setTemplateName('');
    toast.success('模板已保存');
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('确定删除此模板吗？')) {
      ExportTemplateManager.deleteTemplate(id);
      setTemplates(ExportTemplateManager.getAllTemplates());
      toast.success('模板已删除');
    }
  };

  const handleExport = () => {
    if (!selectedTemplate) {
      toast.error('请先选择模板');
      return;
    }

    if (onExport) {
      onExport(selectedTemplate, content);
      onOpenChange(false);
      toast.success('导出成功');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导出模板和样式定制</DialogTitle>
          <DialogDescription>
            选择或自定义导出模板，设置页眉页脚、班级信息等
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">模板选择</TabsTrigger>
            <TabsTrigger value="customize">样式定制</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>

          {/* 模板选择 */}
          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">预设模板</h4>
              {templates
                .filter((t) => t.isDefault)
                .map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary'
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <h5 className="font-semibold">{template.name}</h5>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </Card>
                ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">自定义模板</h4>
              {templates
                .filter((t) => !t.isDefault)
                .map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary'
                    }`}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold">{template.name}</h5>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

              {/* 创建新模板 */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">创建新模板</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="template-name" className="text-sm mb-1 block">
                      模板名称
                    </Label>
                    <Input
                      id="template-name"
                      placeholder="输入模板名称"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSaveTemplate} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    保存当前设置为模板
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* 样式定制 */}
          <TabsContent value="customize" className="space-y-4">
            {selectedTemplate && (
              <>
                {/* 页面设置 */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">页面设置</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-1 block">纸张尺寸</Label>
                      <select
                        value={editingSettings.pageSize}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            pageSize: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="A4">A4</option>
                        <option value="A3">A3</option>
                        <option value="Letter">Letter</option>
                        <option value="Legal">Legal</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">方向</Label>
                      <select
                        value={editingSettings.orientation}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            orientation: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="portrait">纵向</option>
                        <option value="landscape">横向</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* 班级信息 */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">班级信息</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm mb-1 block">学校名称</Label>
                      <Input
                        value={editingSettings.schoolInfo.schoolName}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            schoolInfo: {
                              ...editingSettings.schoolInfo,
                              schoolName: e.target.value,
                            },
                          })
                        }
                        placeholder="输入学校名称"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm mb-1 block">年级</Label>
                        <Input
                          value={editingSettings.schoolInfo.grade}
                          onChange={(e) =>
                            setEditingSettings({
                              ...editingSettings,
                              schoolInfo: {
                                ...editingSettings.schoolInfo,
                                grade: e.target.value,
                              },
                            })
                          }
                          placeholder="如：高一"
                        />
                      </div>
                      <div>
                        <Label className="text-sm mb-1 block">班级</Label>
                        <Input
                          value={editingSettings.schoolInfo.className}
                          onChange={(e) =>
                            setEditingSettings({
                              ...editingSettings,
                              schoolInfo: {
                                ...editingSettings.schoolInfo,
                                className: e.target.value,
                              },
                            })
                          }
                          placeholder="如：1班"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">科目</Label>
                      <Input
                        value={editingSettings.schoolInfo.subject}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            schoolInfo: {
                              ...editingSettings.schoolInfo,
                              subject: e.target.value,
                            },
                          })
                        }
                        placeholder="如：数学"
                      />
                    </div>
                  </div>
                </Card>

                {/* 文字样式 */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">文字样式</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm mb-1 block">标题大小</Label>
                      <Input
                        type="number"
                        value={editingSettings.styles.titleFontSize}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            styles: {
                              ...editingSettings.styles,
                              titleFontSize: parseInt(e.target.value) || 24,
                            },
                          })
                        }
                        min="10"
                        max="48"
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">正文大小</Label>
                      <Input
                        type="number"
                        value={editingSettings.styles.bodyFontSize}
                        onChange={(e) =>
                          setEditingSettings({
                            ...editingSettings,
                            styles: {
                              ...editingSettings.styles,
                              bodyFontSize: parseInt(e.target.value) || 12,
                            },
                          })
                        }
                        min="8"
                        max="24"
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* 预览 */}
          <TabsContent value="preview" className="space-y-4">
            <Card className="p-4 bg-muted/50 max-h-[400px] overflow-y-auto">
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-semibold">纸张:</span> {editingSettings.pageSize}{' '}
                  {editingSettings.orientation === 'portrait' ? '纵向' : '横向'}
                </div>
                {editingSettings.schoolInfo.enabled && (
                  <>
                    <div>
                      <span className="font-semibold">学校:</span>{' '}
                      {editingSettings.schoolInfo.schoolName || '未设置'}
                    </div>
                    <div>
                      <span className="font-semibold">年级班级:</span>{' '}
                      {editingSettings.schoolInfo.grade} {editingSettings.schoolInfo.className}
                    </div>
                    <div>
                      <span className="font-semibold">科目:</span>{' '}
                      {editingSettings.schoolInfo.subject || '未设置'}
                    </div>
                  </>
                )}
                <div>
                  <span className="font-semibold">标题大小:</span>{' '}
                  {editingSettings.styles.titleFontSize}pt
                </div>
                <div>
                  <span className="font-semibold">正文大小:</span>{' '}
                  {editingSettings.styles.bodyFontSize}pt
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 导出按钮 */}
        <div className="flex gap-2 border-t pt-4">
          <Button onClick={handleExport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            导出为 PDF
          </Button>
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
