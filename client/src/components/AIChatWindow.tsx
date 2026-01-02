import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Settings, Loader2, Copy, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AIModelConfig {
  provider: string;
  apiKey: string;
  modelName: string;
  apiUrl?: string;
}

interface AIChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText?: string;
}

const PREDEFINED_AGENTS = [
  { id: 'math-teacher', name: '数学老师', prompt: '你是一位经验丰富的数学教师，擅长解题、出题和批改。' },
  { id: 'chinese-teacher', name: '语文老师', prompt: '你是一位专业的语文教师，擅长文章批改、改写和分析。' },
  { id: 'exam-grader', name: '试卷批改官', prompt: '你是一位专业的试卷批改员，能准确评分并给出详细反馈。' },
  { id: 'document-analyst', name: '文档分析师', prompt: '你是一位专业的文档分析师，能提取关键信息、总结内容。' },
];

const MODEL_PRESETS = {
  openai: { name: 'OpenAI', defaultModel: 'gpt-4', apiUrl: 'https://api.openai.com/v1' },
  claude: { name: 'Anthropic Claude', defaultModel: 'claude-3-5-sonnet-20241022', apiUrl: 'https://api.anthropic.com' },
  gemini: { name: 'Google Gemini', defaultModel: 'gemini-2.0-flash', apiUrl: 'https://generativelanguage.googleapis.com' },
  qwen: { name: '阿里通义千问', defaultModel: 'qwen-max', apiUrl: 'https://dashscope.aliyuncs.com/api' },
  baidu: { name: '百度文心一言', defaultModel: 'ernie-bot', apiUrl: 'https://aip.baidubce.com/rpc' },
};

export default function AIChatWindow({
  open,
  onOpenChange,
  selectedText,
}: AIChatWindowProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('math-teacher');
  const [provider, setProvider] = useState<string>('openai');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedText && open) {
      setInputMessage(selectedText);
    }
  }, [selectedText, open]);

  const callAIAPI = useCallback(async (message: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('请先配置 API 密钥');
    }

    const agent = PREDEFINED_AGENTS.find(a => a.id === selectedAgent);
    const systemPrompt = agent?.prompt || '';
    const fullMessage = `${systemPrompt}\n\n用户消息: ${message}`;

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: fullMessage }],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
      } else if (provider === 'claude') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 2000,
            messages: [{ role: 'user', content: fullMessage }],
          }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.content[0].text;
      } else if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullMessage }] }],
            }),
          }
        );
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('不支持的模型提供商');
      }
    } catch (error) {
      throw new Error(`API 调用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [provider, apiKey, modelName, selectedAgent]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) {
      toast.error('请输入消息');
      return;
    }

    if (!apiKey) {
      toast.error('请先配置 API 密钥');
      setShowSettings(true);
      return;
    }

    const userMessage: AIMessage = {
      id: `msg-${messageIdRef.current++}`,
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await callAIAPI(inputMessage);
      const assistantMessage: AIMessage = {
        id: `msg-${messageIdRef.current++}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '请求失败');
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, apiKey, callAIAPI]);

  const handleQuickAction = useCallback(async (action: string) => {
    const actionPrompts: Record<string, string> = {
      analyze: '请分析以下文档的主要内容、结构和关键信息：',
      summarize: '请为以下内容生成一份简洁的摘要：',
      generate_exam: '请根据以下内容生成 5 道适合中学的选择题和 2 道解答题：',
      grade_exam: '请批改以下试卷答案，给出分数和改进建议：',
      rewrite: '请改写以下内容，使其更清晰、更简洁：',
    };

    const prompt = actionPrompts[action] || '';
    if (prompt) {
      setInputMessage(prompt);
    }
  }, []);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    toast.success('对话已清空');
  }, []);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('已复制到剪贴板');
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI 助手</DialogTitle>
          <DialogDescription>
            使用 AI 进行文档分析、试卷生成、批改等操作
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">对话</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-muted/30 rounded">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>开始对话，或选择快速操作</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card
                      className={`max-w-xs p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyMessage(msg.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 快速操作按钮 */}
            {messages.length === 0 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('analyze')}
                >
                  文档分析
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('generate_exam')}
                >
                  生成试卷
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('grade_exam')}
                >
                  批改试卷
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('rewrite')}
                >
                  改写文章
                </Button>
              </div>
            )}

            {/* 输入框 */}
            <div className="flex gap-2">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="输入消息或选择快速操作..."
                className="flex-1 min-h-[80px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={handleClearMessages}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto space-y-4 p-4">
            {/* Agent 选择 */}
            <div>
              <label className="text-sm font-medium">选择角色</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_AGENTS.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 模型提供商选择 */}
            <div>
              <label className="text-sm font-medium">模型提供商</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODEL_PRESETS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* API 密钥 */}
            <div>
              <label className="text-sm font-medium">API 密钥</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入您的 API 密钥"
              />
            </div>

            {/* 模型名称 */}
            <div>
              <label className="text-sm font-medium">模型名称</label>
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={MODEL_PRESETS[provider as keyof typeof MODEL_PRESETS]?.defaultModel}
              />
            </div>

            {/* 自定义 API 地址 */}
            <div>
              <label className="text-sm font-medium">自定义 API 地址（可选）</label>
              <Input
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <Button onClick={() => setActiveTab('chat')} className="w-full">
              保存设置并开始对话
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
