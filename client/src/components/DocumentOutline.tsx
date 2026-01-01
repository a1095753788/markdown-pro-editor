import React, { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface DocumentOutlineProps {
  content: string;
  onHeadingClick: (id: string) => void;
}

export default function DocumentOutline({
  content,
  onHeadingClick,
}: DocumentOutlineProps) {
  const headings = useMemo(() => {
    const lines = content.split('\n');
    const extractedHeadings: Heading[] = [];
    let headingCount = 0;

    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const id = `heading-${headingCount}`;
        extractedHeadings.push({ level, text, id });
        headingCount++;
      }
    });

    return extractedHeadings;
  }, [content]);

  if (headings.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        文档中没有标题
      </div>
    );
  }

  return (
    <div className="space-y-1 p-4">
      <h3 className="text-sm font-semibold mb-3">文档大纲</h3>
      {headings.map((heading, index) => (
        <div
          key={index}
          style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          className="text-sm"
        >
          <button
            onClick={() => onHeadingClick(heading.id)}
            className="text-primary hover:underline text-left w-full truncate py-1 px-2 rounded hover:bg-muted transition-colors"
            title={heading.text}
          >
            {heading.text}
          </button>
        </div>
      ))}
    </div>
  );
}
