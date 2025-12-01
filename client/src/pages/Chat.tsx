import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Send, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Bot,
  User
} from 'lucide-react';
import MessageInspector from '../components/MessageInspector';

interface Evaluation {
  length: { score: number; feedback: string };
  repetition: { score: number; feedback: string };
  structure: { score: number; feedback: string };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  qualityScore: number | null;
  evaluation: Evaluation | null;
  contradictions: string[];
  createdAt: string;
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setMessages(prev => [...prev, data.data.userMessage, data.data.assistantMessage]);
      }
    },
  });

  // Improve message mutation
  const improveMessage = useMutation({
    mutationFn: async ({ messageId, type }: { messageId: string; type: string }) => {
      const res = await fetch('/api/chat/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, improvementType: type }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
      }
    },
  });

  const handleSend = () => {
    if (input.trim() && !sendMessage.isPending) {
      sendMessage.mutate(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImprove = (messageId: string, type: string) => {
    improveMessage.mutate({ messageId, type });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">محادثة مع رقيم</h1>
        <p className="text-gray-600">تحدث مع المساعد الذكي واحصل على تقييم جودة الردود</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">مرحباً بك!</h3>
                <p className="text-gray-500 max-w-sm">
                  ابدأ محادثة مع رقيم AI. سأساعدك في إدارة مشاريعك وإنشاء المحتوى.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['مرحبا رقيم', 'ساعدني في مشروع', 'أريد كتابة محتوى'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isExpanded={expandedMessage === message.id}
                onToggleExpand={() => 
                  setExpandedMessage(expandedMessage === message.id ? null : message.id)
                }
                onImprove={(type) => handleImprove(message.id, type)}
                isImproving={improveMessage.isPending}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[52px] max-h-32"
              rows={1}
              disabled={sendMessage.isPending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 ${
                input.trim() && !sendMessage.isPending
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sendMessage.isPending ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onImprove: (type: string) => void;
  isImproving: boolean;
}

function ChatMessage({ message, isExpanded, onToggleExpand, onImprove, isImproving }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasEvaluation = message.evaluation && message.qualityScore !== null;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fadeIn`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blue-100' : 'bg-green-100'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-blue-600" />
        ) : (
          <Bot className="w-5 h-5 text-green-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-left' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Quality Score Badge */}
        {hasEvaluation && (
          <div className="mt-2">
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <QualityBadge score={message.qualityScore!} />
              <span>تقييم الجودة</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Expanded Evaluation */}
            {isExpanded && (
              <div className="mt-3 animate-fadeIn">
                <MessageInspector
                  evaluation={message.evaluation!}
                  contradictions={message.contradictions}
                  overallScore={message.qualityScore!}
                />

                {/* Improvement Buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => onImprove('shorter')}
                    disabled={isImproving}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    اختصار
                  </button>
                  <button
                    onClick={() => onImprove('longer')}
                    disabled={isImproving}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    توسيع
                  </button>
                  <button
                    onClick={() => onImprove('restructure')}
                    disabled={isImproving}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    إعادة هيكلة
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QualityBadge({ score }: { score: number }) {
  const getColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-700';
    if (score >= 70) return 'bg-blue-100 text-blue-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getLabel = (score: number) => {
    if (score >= 85) return 'ممتاز';
    if (score >= 70) return 'جيد';
    if (score >= 50) return 'متوسط';
    return 'ضعيف';
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getColor(score)}`}>
      {score}% - {getLabel(score)}
    </span>
  );
}

export default ChatPage;
