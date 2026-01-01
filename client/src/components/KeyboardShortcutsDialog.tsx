import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Shortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: '文件操作',
    items: [
      { key: 'Ctrl+N', description: '新建文件' },
      { key: 'Ctrl+O', description: '打开文件' },
      { key: 'Ctrl+S', description: '保存文件' },
      { key: 'Ctrl+P', description: '打印' },
    ],
  },
  {
    category: '编辑',
    items: [
      { key: 'Ctrl+Z', description: '撤销' },
      { key: 'Ctrl+Y', description: '重做' },
      { key: 'Ctrl+H', description: '搜索和替换' },
      { key: 'Ctrl+F', description: '搜索' },
    ],
  },
  {
    category: '格式化',
    items: [
      { key: 'Ctrl+B', description: '加粗' },
      { key: 'Ctrl+I', description: '斜体' },
      { key: 'Ctrl+`', description: '代码' },
      { key: 'Ctrl+1', description: '一级标题' },
      { key: 'Ctrl+2', description: '二级标题' },
      { key: 'Ctrl+L', description: '无序列表' },
      { key: 'Ctrl+Shift+L', description: '有序列表' },
      { key: 'Ctrl+K', description: '链接' },
      { key: 'Ctrl+Shift+I', description: '图片' },
      { key: 'Ctrl+Q', description: '引用' },
    ],
  },
  {
    category: '视图',
    items: [
      { key: 'Ctrl+Shift+D', description: '切换深色模式' },
      { key: 'Ctrl+Shift+O', description: '切换大纲面板' },
      { key: 'Ctrl+Shift+S', description: '切换统计面板' },
    ],
  },
];

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>快捷键帮助</DialogTitle>
          <DialogDescription>
            查看所有可用的快捷键
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map((group, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold mb-3">{group.category}</h3>
              <div className="space-y-2">
                {group.items.map((shortcut, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
