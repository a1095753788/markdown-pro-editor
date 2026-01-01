import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';

interface StatisticsPanelProps {
  content: string;
}

export default function StatisticsPanel({ content }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    // 移除 Markdown 语法
    const plainText = content
      .replace(/^#+\s+/gm, '') // 移除标题
      .replace(/\*\*|__/g, '') // 移除加粗
      .replace(/\*|_/g, '') // 移除斜体
      .replace(/~~(.+?)~~/g, '$1') // 移除删除线
      .replace(/`(.+?)`/g, '$1') // 移除行内代码
      .replace(/```[\s\S]*?```/g, '') // 移除代码块
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // 移除链接
      .replace(/!\[(.+?)\]\(.+?\)/g, '$1') // 移除图片
      .replace(/^>\s+/gm, '') // 移除引用
      .replace(/^[-*+]\s+/gm, '') // 移除列表
      .replace(/^\d+\.\s+/gm, '') // 移除有序列表
      .replace(/\|/g, '') // 移除表格符号
      .trim();

    const characters = plainText.length;
    const words = plainText.split(/\s+/).filter((word) => word.length > 0).length;
    const lines = content.split('\n').length;
    const paragraphs = content
      .split(/\n\n+/)
      .filter((para) => para.trim().length > 0).length;

    // 计算阅读时间（假设平均每分钟 200 个词）
    const readingTimeMinutes = Math.ceil(words / 200);

    // 计算代码块数量
    const codeBlocks = (content.match(/```/g) || []).length / 2;

    // 计算标题数量
    const headings = (content.match(/^#+\s+/gm) || []).length;

    // 计算链接数量
    const links = (content.match(/\[.+?\]\(.+?\)/g) || []).length;

    // 计算图片数量
    const images = (content.match(/!\[.+?\]\(.+?\)/g) || []).length;

    return {
      characters,
      words,
      lines,
      paragraphs,
      readingTimeMinutes,
      codeBlocks: Math.floor(codeBlocks),
      headings,
      links,
      images,
    };
  }, [content]);

  return (
    <div className="space-y-3 p-4">
      <h3 className="text-sm font-semibold mb-3">文档统计</h3>

      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">字符数</div>
          <div className="text-lg font-semibold">{stats.characters}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">单词数</div>
          <div className="text-lg font-semibold">{stats.words}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">行数</div>
          <div className="text-lg font-semibold">{stats.lines}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">段落数</div>
          <div className="text-lg font-semibold">{stats.paragraphs}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">阅读时间</div>
          <div className="text-lg font-semibold">
            {stats.readingTimeMinutes} 分钟
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">代码块</div>
          <div className="text-lg font-semibold">{stats.codeBlocks}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">标题</div>
          <div className="text-lg font-semibold">{stats.headings}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">链接</div>
          <div className="text-lg font-semibold">{stats.links}</div>
        </Card>

        <Card className="p-3">
          <div className="text-xs text-muted-foreground">图片</div>
          <div className="text-lg font-semibold">{stats.images}</div>
        </Card>
      </div>
    </div>
  );
}
