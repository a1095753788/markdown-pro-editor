import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  QuestionBankManager,
  QuestionBank,
  QuestionBankFile,
  QuestionBankQuestion,
} from '@/lib/questionBankManager';
import { FolderOpen, Plus, Trash2, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateExam?: (questions: QuestionBankQuestion[]) => void;
}

export default function QuestionBankDialog({
  open,
  onOpenChange,
  onGenerateExam,
}: QuestionBankDialogProps) {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<QuestionBank | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionBankQuestion[]>([]);
  const [bankName, setBankName] = useState('');
  const [bankDescription, setBankDescription] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    if (open) {
      setBanks(QuestionBankManager.getAllBanks());
    }
  }, [open]);

  const handleCreateBank = () => {
    if (!bankName.trim()) {
      toast.error('请输入题库名称');
      return;
    }

    const newBank = QuestionBankManager.createBank(bankName, bankDescription);
    setBanks([...banks, newBank]);
    setBankName('');
    setBankDescription('');
    toast.success('题库创建成功');
  };

  const handleDeleteBank = (bankId: string) => {
    if (confirm('确定删除此题库吗？')) {
      QuestionBankManager.deleteBank(bankId);
      setBanks(banks.filter((b) => b.id !== bankId));
      if (selectedBank?.id === bankId) {
        setSelectedBank(null);
      }
      toast.success('题库已删除');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedBank) return;

    try {
      const content = await file.text();
      const bankFile: QuestionBankFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        path: file.name,
        content,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };

      QuestionBankManager.addFileToBank(selectedBank.id, bankFile);

      // 更新 UI
      const updatedBank = QuestionBankManager.getBank(selectedBank.id);
      if (updatedBank) {
        setSelectedBank(updatedBank);
        setBanks(banks.map((b) => (b.id === updatedBank.id ? updatedBank : b)));
      }

      toast.success(`文件添加成功: ${file.name}`);
    } catch (error) {
      toast.error(`文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleToggleQuestion = (question: QuestionBankQuestion) => {
    const isSelected = selectedQuestions.some((q) => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleGenerateExam = () => {
    if (selectedQuestions.length === 0) {
      toast.error('请先选择题目');
      return;
    }

    if (onGenerateExam) {
      onGenerateExam(selectedQuestions);
      onOpenChange(false);
      setSelectedQuestions([]);
      toast.success('试卷已生成');
    }
  };

  const handleExportBank = () => {
    if (!selectedBank) return;

    const json = QuestionBankManager.exportBankAsJson(selectedBank.id);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedBank.name}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('题库已导出');
  };

  const getFilteredQuestions = (): QuestionBankQuestion[] => {
    if (!selectedBank) return [];

    const allQuestions = selectedBank.files.reduce((acc, file) => {
      return acc.concat(file.questions || []);
    }, [] as QuestionBankQuestion[]);

    if (!filterKeyword) return allQuestions;

    return allQuestions.filter(
      (q) =>
        q.title.toLowerCase().includes(filterKeyword.toLowerCase()) ||
        q.content.toLowerCase().includes(filterKeyword.toLowerCase())
    );
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>文件夹题库管理</DialogTitle>
          <DialogDescription>
            创建题库、导入文件、筛选题目、生成试卷
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="banks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="banks">题库列表</TabsTrigger>
            <TabsTrigger value="files" disabled={!selectedBank}>
              文件管理
            </TabsTrigger>
            <TabsTrigger value="questions" disabled={!selectedBank}>
              题目筛选
            </TabsTrigger>
          </TabsList>

          {/* 题库列表 */}
          <TabsContent value="banks" className="space-y-4">
            {/* 创建新题库 */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">创建新题库</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bank-name" className="text-sm mb-1 block">
                    题库名称
                  </Label>
                  <Input
                    id="bank-name"
                    placeholder="输入题库名称"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bank-desc" className="text-sm mb-1 block">
                    描述 (可选)
                  </Label>
                  <Input
                    id="bank-desc"
                    placeholder="输入题库描述"
                    value={bankDescription}
                    onChange={(e) => setBankDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateBank} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  创建题库
                </Button>
              </div>
            </Card>

            {/* 题库列表 */}
            <div className="space-y-2">
              <h4 className="font-semibold">我的题库</h4>
              {banks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  还没有创建任何题库
                </div>
              ) : (
                banks.map((bank) => (
                  <Card
                    key={bank.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedBank?.id === bank.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary'
                    }`}
                    onClick={() => setSelectedBank(bank)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold">{bank.name}</h5>
                        {bank.description && (
                          <p className="text-sm text-muted-foreground">{bank.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>文件: {bank.files.length}</span>
                          <span>题目: {bank.totalQuestions}</span>
                          <span>
                            创建: {new Date(bank.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBank(bank.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* 文件管理 */}
          <TabsContent value="files" className="space-y-4">
            {selectedBank && (
              <>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="bank-file-upload"
                    className="hidden"
                    accept=".txt,.md,.markdown"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="bank-file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FolderOpen className="w-6 h-6 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">点击选择文件或拖拽上传</p>
                      <p className="text-xs text-muted-foreground">支持 TXT、MD 格式</p>
                    </div>
                  </label>
                </div>

                {/* 文件列表 */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">已导入文件</h4>
                  {selectedBank.files.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      还没有导入任何文件
                    </div>
                  ) : (
                    selectedBank.files.map((file) => (
                      <Card key={file.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {file.questions?.length || 0} 道题目
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // 删除文件逻辑
                              toast.info('删除功能开发中');
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* 题目筛选 */}
          <TabsContent value="questions" className="space-y-4">
            {selectedBank && (
              <>
                <div>
                  <Label htmlFor="filter-keyword" className="text-sm mb-2 block">
                    搜索题目
                  </Label>
                  <Input
                    id="filter-keyword"
                    placeholder="输入关键词筛选题目"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                  />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {filteredQuestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      没有找到匹配的题目
                    </div>
                  ) : (
                    filteredQuestions.map((question) => (
                      <Card key={question.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedQuestions.some((q) => q.id === question.id)}
                            onCheckedChange={() => handleToggleQuestion(question)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{question.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {question.content}
                            </p>
                            <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                              {question.difficulty && <span>难度: {question.difficulty}</span>}
                              {question.score && <span>分值: {question.score}</span>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex gap-2 border-t pt-4">
                  <Button onClick={handleGenerateExam} className="flex-1">
                    生成试卷 ({selectedQuestions.length} 道题)
                  </Button>
                  <Button onClick={handleExportBank} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    导出题库
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
