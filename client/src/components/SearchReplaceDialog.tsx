import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface SearchReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onReplace: (newContent: string) => void;
}

export default function SearchReplaceDialog({
  open,
  onOpenChange,
  content,
  onReplace,
}: SearchReplaceDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);

  const getMatches = useCallback(() => {
    if (!searchTerm) return [];

    try {
      let pattern: RegExp;
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(searchTerm, flags);
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        if (wholeWord) {
          pattern = new RegExp(`\\b${escapedTerm}\\b`, flags);
        } else {
          pattern = new RegExp(escapedTerm, flags);
        }
      }

      const matches = Array.from(content.matchAll(pattern));
      setMatchCount(matches.length);
      return matches;
    } catch (e) {
      setMatchCount(0);
      return [];
    }
  }, [searchTerm, content, caseSensitive, wholeWord, useRegex]);

  const handleReplace = useCallback(() => {
    if (!searchTerm) return;

    try {
      let result: string;
      if (useRegex) {
        const flags = caseSensitive ? 'g' : 'gi';
        const pattern = new RegExp(searchTerm, flags);
        result = content.replace(pattern, replaceTerm);
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? 'g' : 'gi';
        let pattern: RegExp;
        if (wholeWord) {
          pattern = new RegExp(`\\b${escapedTerm}\\b`, flags);
        } else {
          pattern = new RegExp(escapedTerm, flags);
        }
        result = content.replace(pattern, replaceTerm);
      }

      onReplace(result);
      setCurrentMatch(0);
    } catch (e) {
      alert('替换失败：' + (e instanceof Error ? e.message : '未知错误'));
    }
  }, [searchTerm, replaceTerm, content, caseSensitive, wholeWord, useRegex, onReplace]);

  const handleReplaceOne = useCallback(() => {
    if (!searchTerm) return;

    try {
      let result: string;
      if (useRegex) {
        const flags = caseSensitive ? '' : 'i';
        const pattern = new RegExp(searchTerm, flags);
        result = content.replace(pattern, replaceTerm);
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const flags = caseSensitive ? '' : 'i';
        let pattern: RegExp;
        if (wholeWord) {
          pattern = new RegExp(`\\b${escapedTerm}\\b`, flags);
        } else {
          pattern = new RegExp(escapedTerm, flags);
        }
        result = content.replace(pattern, replaceTerm);
      }

      onReplace(result);
    } catch (e) {
      alert('替换失败：' + (e instanceof Error ? e.message : '未知错误'));
    }
  }, [searchTerm, replaceTerm, content, caseSensitive, wholeWord, useRegex, onReplace]);

  React.useEffect(() => {
    if (open) {
      getMatches();
    }
  }, [open, searchTerm, caseSensitive, wholeWord, useRegex, getMatches]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>搜索和替换</DialogTitle>
          <DialogDescription>
            在文档中查找和替换文本
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 搜索 */}
          <div className="space-y-2">
            <Label htmlFor="search">搜索</Label>
            <Input
              id="search"
              placeholder="输入搜索词..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentMatch(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleReplace();
                }
              }}
            />
            {matchCount > 0 && (
              <p className="text-xs text-muted-foreground">
                找到 {matchCount} 处匹配
              </p>
            )}
          </div>

          {/* 替换 */}
          <div className="space-y-2">
            <Label htmlFor="replace">替换为</Label>
            <Input
              id="replace"
              placeholder="输入替换词..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleReplace();
                }
              }}
            />
          </div>

          {/* 选项 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="case-sensitive"
                checked={caseSensitive}
                onCheckedChange={(checked) =>
                  setCaseSensitive(checked as boolean)
                }
              />
              <Label htmlFor="case-sensitive" className="cursor-pointer">
                区分大小写
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="whole-word"
                checked={wholeWord}
                onCheckedChange={(checked) => setWholeWord(checked as boolean)}
              />
              <Label htmlFor="whole-word" className="cursor-pointer">
                全词匹配
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="use-regex"
                checked={useRegex}
                onCheckedChange={(checked) => setUseRegex(checked as boolean)}
              />
              <Label htmlFor="use-regex" className="cursor-pointer">
                使用正则表达式
              </Label>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReplaceOne}
              disabled={!searchTerm || matchCount === 0}
              className="flex-1"
            >
              替换
            </Button>
            <Button
              onClick={handleReplace}
              disabled={!searchTerm || matchCount === 0}
              className="flex-1"
            >
              全部替换
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
