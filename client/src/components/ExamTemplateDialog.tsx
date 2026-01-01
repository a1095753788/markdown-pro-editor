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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { examTemplates, getTemplatesByGrade } from '@/data/examTemplates';
import { FileText } from 'lucide-react';

interface ExamTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string, templateName: string) => void;
}

export default function ExamTemplateDialog({
  open,
  onOpenChange,
  onSelect,
}: ExamTemplateDialogProps) {
  const [selectedGrade, setSelectedGrade] = useState<'junior' | 'senior'>('junior');

  const templates = getTemplatesByGrade(selectedGrade);

  const handleSelectTemplate = (template: typeof examTemplates[0]) => {
    onSelect(template.content, template.name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>选择试卷模板</DialogTitle>
          <DialogDescription>
            选择一个标准试卷模板开始编写
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 年级选择 */}
          <Tabs
            value={selectedGrade}
            onValueChange={(value) =>
              setSelectedGrade(value as 'junior' | 'senior')
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="junior">初中</TabsTrigger>
              <TabsTrigger value="senior">高中</TabsTrigger>
            </TabsList>

            <TabsContent value="junior" className="space-y-3 mt-4">
              {getTemplatesByGrade('junior').map((template) => (
                <Card
                  key={template.id}
                  className="p-4 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start gap-4">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                        使用此模板
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="senior" className="space-y-3 mt-4">
              {getTemplatesByGrade('senior').map((template) => (
                <Card
                  key={template.id}
                  className="p-4 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start gap-4">
                    <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <Button size="sm" onClick={() => handleSelectTemplate(template)}>
                        使用此模板
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
