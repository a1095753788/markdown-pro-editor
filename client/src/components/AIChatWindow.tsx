import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { AIMessage, AIModelConfig, PREDEFINED_AGENTS, MODEL_PRESETS } from '@/types/ai';
import { createAIService } from '@/lib/aiService';
import { Send, Settings, Loader2, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AIChatWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText?: string;
}

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
  const [modelConfig, setModelConfig] = useState<AIModelConfig | null>(null);
  const [provider, setProvider] = useState<string>('openai');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4');
  const [customApiUrl, setCustomApiUrl] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 当选中文本改变时，自动添加到输入框
  useEffect(() => {
    if (selectedText && open) {
      setInputMessage(selectedText);
    }
  }, [selectedText, open]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !modelConfig) {
      toast.error('请先配置 AI 模型');
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
      const aiService = createAIService(modelConfig);
      const agent = PREDEFINED_AGENTS.find((a) => a.id === selectedAgent);
      const systemPrompt = agent?.systemPrompt;

      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await aiService.sendMessage(
        inputMessage,
        systemPrompt,
        conversationHistory
      );

      if (response.success && response.data) {
        const assistantMessage: AIMessage = {
          id: `msg-${messageIdRef.current++}`,
          role: 'assistant',
          content: response.data,
          timestamp: Date.now(),
          metadata: {
            modelUsed: modelConfig.modelName,
            tokensUsed: response.usage?.totalTokens,
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error(response.error || 'AI 回复失败');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '发送消息失败');
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, modelConfig, selectedAgent, messages]);

  const handleConfigureModel = useCallback(async () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API 密钥');
      return;
    }

    const config: AIModelConfig = {
      provider: provider as any,
      apiKey,
      modelName,
      apiUrl: customApiUrl || undefined,
      temperature: 0.7,
      maxTokens: 2000,
    };

    setModelConfig(config);
    setShowSettings(false);
    toast.success('AI 模型已配置');
  }, [provider, apiKey, modelName, customApiUrl]);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('已复制到剪贴板');
  };

  const handleClearMessages = () => {
    if (confirm('确定要清空所有对话吗？')) {
      setMessages([]);
      toast.success('对话已清空');
    }
  };

  const selectedProviderPreset = MODEL_PRESETS[provider as keyof typeof MODEL_PRESETS];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI 助手</DialogTitle>
          <DialogDescription>
            {modelConfig
              ? `已连接: ${modelConfig.modelName}`
              : '请先配置 AI 模型'}
          </DialogDescription>
        </DialogHeader>

        {!showSettings ? (
          <div className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>开始对话吧！</p>
                  <p className="text-sm mt-2">选择一个 Agent 角色，输入您的问题</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <Card
                      className={`max-w-xs px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      {msg.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-6 px-2"
                          onClick={() => handleCopyMessage(msg.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </Card>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Agent 选择 */}
            <div className="px-4">
              <label className="text-sm font-medium mb-2 block">选择 Agent 角色</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PREDEFINED_AGENTS.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.icon} {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 输入框 */}
            <div className="flex gap-2 px-4">
              <Textarea
                placeholder="输入您的问题..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSendMessage();
                  }
                }}
                className="flex-1 min-h-[80px]"
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !modelConfig}
                  size="sm"
                  className="h-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearMessages}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // 设置面板
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div>
              <label className="text-sm font-medium mb-2 block">模型提供商</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="claude">Claude</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="qwen">阿里通义千问</SelectItem>
                  <SelectItem value="wenxin">百度文心一言</SelectItem>
                  <SelectItem value="xinghuo">讯飞星火</SelectItem>
                  <SelectItem value="ollama">Ollama (本地)</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">模型</label>
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProviderPreset?.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">API 密钥</label>
              <Input
                type="password"
                placeholder="输入您的 API 密钥"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                您的密钥仅在此会话中使用，不会被保存
              </p>
            </div>

            {provider === 'custom' && (
              <div>
                <label className="text-sm font-medium mb-2 block">API 地址</label>
                <Input
                  placeholder="https://api.example.com/v1"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                />
              </div>
            )}

            {provider === 'ollama' && (
              <div>
                <label className="text-sm font-medium mb-2 block">本地 API 地址</label>
                <Input
                  placeholder="http://localhost:11434/api"
                  value={customApiUrl}
                  onChange={(e) => setCustomApiUrl(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={handleConfigureModel} className="flex-1">
                保存配置
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="flex-1"
              >
                返回
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
