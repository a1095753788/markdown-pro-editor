import React, { useState, useCallback } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  extractQuestionsFromMarkdown,
  filterQuestions,
  generateExamByDifficulty,
  selectQuestionsRandomly,
  getQuestionStats,
  exportQuestionsAsMarkdown,
  Question,
  FilterCriteria,
} from '@/lib/questionFilter';
import { Download, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  fileName: string;
  onGenerateExam?: (questions: Question[]) => void;
}

export default function QuestionFilterDialog({
  open,
  onOpenChange,
  content,
  fileName,
  onGenerateExam,
}: QuestionFilterDialogProps) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<any>(null);

  // 筛选条件
  const [criteria, setCriteria] = useState<FilterCriteria>({
    types: [],
    difficulties: [],
    subjects: [],
    keywords: [],
  });

  const [totalScore, setTotalScore] = useState(100);
  const [easyPercent, setEasyPercent] = useState(30);
  const [mediumPercent, setMediumPercent] = useState(50);
  const [hardPercent, setHardPercent] = useState(20);

  const handleExtractQuestions = useCallback(() => {
    const questions = extractQuestionsFromMarkdown(content, fileName);
    setAllQuestions(questions);
    setFilteredQuestions(questions);
    setStats(getQuestionStats(questions));
    toast.success(`已提取 ${questions.length} 道试题`);
  }, [content, fileName]);

  const handleFilter = useCallback(() => {
    const filtered = filterQuestions(allQuestions, criteria);
    setFilteredQuestions(filtered);
    setStats(getQuestionStats(filtered));
    toast.success(`筛选出 ${filtered.length} 道试题`);
  }, [allQuestions, criteria]);

  const handleGenerateByDifficulty = useCallback(() => {
    const selected = generateExamByDifficulty(filteredQuestions, totalScore, {
      easy: easyPercent,
      medium: mediumPercent,
      hard: hardPercent,
    });
    setSelectedQuestions(selected);
    toast.success(`已生成 ${selected.length} 道试题`);
  }, [filteredQuestions, totalScore, easyPercent, mediumPercent, hardPercent]);

  const handleRandomSelect = useCallback(() => {
    const count = Math.ceil(totalScore / 5); // 假设平均每题 5 分
    const selected = selectQuestionsRandomly(filteredQuestions, count);
    setSelectedQuestions(selected);
    toast.success(`已随机选择 ${selected.length} 道试题`);
  }, [filteredQuestions, totalScore]);

  const handleExportExam = useCallback(() => {
    if (selectedQuestions.length === 0) {
      toast.error('请先生成试卷');
      return;
    }

    const markdown = exportQuestionsAsMarkdown(selectedQuestions);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exam-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('试卷已导出');
  }, [selectedQuestions]);

  const handleInsertExam = useCallback(() => {
    if (selectedQuestions.length === 0) {
      toast.error('请先生成试卷');
      return;
    }

    if (onGenerateExam) {
      onGenerateExam(selectedQuestions);
      onOpenChange(false);
      toast.success('试卷已插入编辑器');
    }
  }, [selectedQuestions, onGenerateExam, onOpenChange]);

  const handleToggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      const question = allQuestions.find((q) => q.id === questionId);
      if (!question) return prev;

      const isSelected = prev.some((q) => q.id === questionId);
      if (isSelected) {
        return prev.filter((q) => q.id !== questionId);
      } else {
        return [...prev, question];
      }
    });
  };

  const handleToggleType = (type: string) => {
    setCriteria((prev) => ({
      ...prev,
      types: prev.types?.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...(prev.types || []), type],
    }));
  };

  const handleToggleDifficulty = (difficulty: string) => {
    setCriteria((prev) => ({
      ...prev,
      difficulties: prev.difficulties?.includes(difficulty)
        ? prev.difficulties.filter((d) => d !== difficulty)
        : [...(prev.difficulties || []), difficulty],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>试题筛选和出卷</DialogTitle>
          <DialogDescription>
            从文档中提取试题，按条件筛选并生成试卷
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="extract">提取试题</TabsTrigger>
            <TabsTrigger value="filter">筛选试题</TabsTrigger>
            <TabsTrigger value="generate">生成试卷</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
          </TabsList>

          {/* 提取试题 */}
          <TabsContent value="extract" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>从当前文档中自动提取试题。</p>
              <p className="mt-2">支持的格式:</p>
              <ul className="list-disc list-inside mt-2">
                <li>## 题目 1 (单选/多选/填空/简答/论述)</li>
                <li>难度: 简单/中等/困难</li>
                <li>分值: 5分</li>
                <li>科目: 数学</li>
              </ul>
            </div>

            <Button onClick={handleExtractQuestions} className="w-full">
              提取试题
            </Button>

            {stats && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">提取结果</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">总试题数:</span>
                    <span className="ml-2 font-semibold">{stats.total}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">总分值:</span>
                    <span className="ml-2 font-semibold">{stats.totalScore}</span>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* 筛选试题 */}
          <TabsContent value="filter" className="space-y-4">
            <div className="space-y-4">
              {/* 题型筛选 */}
              <div>
                <Label className="font-semibold mb-2 block">题型</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['single-choice', 'multiple-choice', 'fill-blank', 'short-answer'].map(
                    (type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={criteria.types?.includes(type) || false}
                          onCheckedChange={() => handleToggleType(type)}
                        />
                        <Label htmlFor={`type-${type}`} className="cursor-pointer">
                          {type === 'single-choice'
                            ? '单选'
                            : type === 'multiple-choice'
                            ? '多选'
                            : type === 'fill-blank'
                            ? '填空'
                            : '简答'}
                        </Label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* 难度筛选 */}
              <div>
                <Label className="font-semibold mb-2 block">难度</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((difficulty) => (
                    <div key={difficulty} className="flex items-center gap-2">
                      <Checkbox
                        id={`difficulty-${difficulty}`}
                        checked={criteria.difficulties?.includes(difficulty) || false}
                        onCheckedChange={() => handleToggleDifficulty(difficulty)}
                      />
                      <Label
                        htmlFor={`difficulty-${difficulty}`}
                        className="cursor-pointer"
                      >
                        {difficulty === 'easy'
                          ? '简单'
                          : difficulty === 'medium'
                          ? '中等'
                          : '困难'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleFilter} className="w-full">
                应用筛选
              </Button>

              {stats && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">筛选结果</h4>
                  <div className="text-sm">
                    <p>
                      <span className="text-muted-foreground">筛选后试题数:</span>
                      <span className="ml-2 font-semibold">{stats.total}</span>
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 生成试卷 */}
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="totalScore" className="font-semibold mb-2 block">
                  总分值
                </Label>
                <Input
                  id="totalScore"
                  type="number"
                  value={totalScore}
                  onChange={(e) => setTotalScore(parseInt(e.target.value) || 100)}
                  min="10"
                  max="500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="easy" className="font-semibold mb-2 block">
                    简单题 (%)
                  </Label>
                  <Input
                    id="easy"
                    type="number"
                    value={easyPercent}
                    onChange={(e) => setEasyPercent(parseInt(e.target.value) || 30)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="medium" className="font-semibold mb-2 block">
                    中等题 (%)
                  </Label>
                  <Input
                    id="medium"
                    type="number"
                    value={mediumPercent}
                    onChange={(e) => setMediumPercent(parseInt(e.target.value) || 50)}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="hard" className="font-semibold mb-2 block">
                    困难题 (%)
                  </Label>
                  <Input
                    id="hard"
                    type="number"
                    value={hardPercent}
                    onChange={(e) => setHardPercent(parseInt(e.target.value) || 20)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleGenerateByDifficulty} className="flex-1">
                  按难度分布生成
                </Button>
                <Button onClick={handleRandomSelect} variant="outline" className="flex-1">
                  随机选择
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 预览 */}
          <TabsContent value="preview" className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {selectedQuestions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  请先生成试卷
                </div>
              ) : (
                selectedQuestions.map((q, index) => (
                  <Card key={q.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {index + 1}. {q.content.substring(0, 50)}...
                        </h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="mr-3">类型: {q.type}</span>
                          <span className="mr-3">难度: {q.difficulty}</span>
                          <span>分值: {q.score}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleQuestion(q.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExportExam} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                导出试卷
              </Button>
              <Button onClick={handleInsertExam} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                插入编辑器
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
