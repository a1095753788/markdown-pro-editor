import { create } from 'zustand';

export interface EditorState {
  content: string;
  history: string[];
  historyIndex: number;
  setContent: (content: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  content: '',
  history: [''],
  historyIndex: 0,

  setContent: (content: string) => {
    set((state) => {
      const { history, historyIndex } = state;
      // 如果当前不在历史的最后，删除之后的所有历史
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      
      // 限制历史记录数量为 100
      if (newHistory.length > 100) {
        newHistory.shift();
        return {
          content,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }

      return {
        content,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  undo: () => {
    set((state) => {
      const { history, historyIndex } = state;
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        return {
          content: history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      const { history, historyIndex } = state;
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        return {
          content: history[newIndex],
          historyIndex: newIndex,
        };
      }
      return state;
    });
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  clearHistory: () => {
    set({
      content: '',
      history: [''],
      historyIndex: 0,
    });
  },
}));
