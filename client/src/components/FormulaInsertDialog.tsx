import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { formulas, searchFormulas } from '@/data/formulas';
import { Copy, Search } from 'lucide-react';
import { toast } from 'sonner';

interface FormulaInsertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string) => void;
}

export default function FormulaInsertDialog({
  open,
  onOpenChange,
  onInsert,
}: FormulaInsertDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedGrade, setSelectedGrade] = useState<'junior' | 'senior'>('junior');

  const filteredFormulas = useMemo(() => {
    let result = formulas.filter((f) => {
      if (selectedGrade === 'junior' || selectedGrade === 'senior') {
        if (f.grade !== selectedGrade && f.grade !== 'both') return false;
      }
      return true;
    });

    if (searchQuery) {
      result = searchFormulas(searchQuery).filter((f) => {
        if (selectedGrade === 'junior' || selectedGrade === 'senior') {
          if (f.grade !== selectedGrade && f.grade !== 'both') return false;
        }
        return true;
      });
    }

    return result;
  }, [searchQuery, selectedGrade]);

  const groupedFormulas = useMemo(() => {
    const grouped: Record<string, typeof formulas> = {};
    filteredFormulas.forEach((f) => {
      if (!grouped[f.category]) {
        grouped[f.category] = [];
      }
      grouped[f.category].push(f);
    });
    return grouped;
  }, [filteredFormulas]);

  const handleCopyLatex = (latex: string) => {
    navigator.clipboard.writeText(latex);
    toast.success('公式已复制到剪贴板');
  };

  const handleInsertFormula = (latex: string) => {
    onInsert(latex);
    onOpenChange(false);
    toast.success('公式已插入');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>插入公式</DialogTitle>
          <DialogDescription>
            从中小学常用公式库中选择或搜索公式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 搜索框 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索公式名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 年级和科目选择 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">年级</label>
              <div className="flex gap-2">
                <Button
                  variant={selectedGrade === 'junior' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGrade('junior')}
                >
                  初中
                </Button>
                <Button
                  variant={selectedGrade === 'senior' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGrade('senior')}
                >
                  高中
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">科目</label>
              <div className="flex gap-2">
                {['数学', '物理', '化学'].map((subject) => (
                  <Button
                    key={subject}
                    variant={
                      selectedSubject === subject.toLowerCase()
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() => setSelectedSubject(subject.toLowerCase())}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 公式列表 */}
          {searchQuery ? (
            <div className="space-y-3">
              {filteredFormulas.length > 0 ? (
                filteredFormulas.map((formula) => (
                  <Card key={formula.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">
                          {formula.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formula.description}
                        </p>
                        <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                          ${formula.latex}$
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLatex(formula.latex)}
                          title="复制 LaTeX 代码"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleInsertFormula(`$${formula.latex}$`)
                          }
                        >
                          插入
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  没有找到匹配的公式
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedFormulas).map(([category, categoryFormulas]) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm mb-3 text-primary">
                    {category}
                  </h4>
                  <div className="space-y-2 ml-4">
                    {categoryFormulas.map((formula) => (
                      <Card key={formula.id} className="p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm mb-1">
                              {formula.name}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              {formula.description}
                            </p>
                            <div className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                              ${formula.latex}$
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLatex(formula.latex)}
                              title="复制"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleInsertFormula(`$${formula.latex}$`)
                              }
                            >
                              插入
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
