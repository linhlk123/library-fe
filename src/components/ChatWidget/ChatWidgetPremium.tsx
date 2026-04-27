import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Moon, Sun } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import type { ChatMessage } from '../../types';

interface ChatWidgetProps {
  role?: 'USER' | 'STAFF';
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ role = 'USER' }) => {
  const isStaff = role === 'STAFF';
  const storageKey = `chat-widget-theme-${role.toLowerCase()}`;
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) === 'dark';
  });
  
  const colorScheme = isStaff 
    ? {
        primary: '#059669',
        primaryLight: '#d1fae5',
        primaryLighter: '#a7f3d0',
        hover: '#047857',
        text: 'Staff Library Assistant',
      }
    : {
        primary: '#059669',
        primaryLight: '#d1fae5',
        primaryLighter: '#a7f3d0',
        hover: '#047857',
        text: 'AI Library Assistant',
      };

  const botTitle = isStaff ? 'BiblioBot (Staff Assistant)' : 'BiblioBot - AI Advisor';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `Hi there! I am ${botTitle}. How can I help you with your library needs today?`,
      sender: 'BOT',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadingAbortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem(storageKey, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, storageKey]);

  const panelBg = isDarkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white border-gray-200';
  const messagesBg = isDarkMode ? 'bg-slate-950' : 'bg-gray-50';
  const botBubbleBg = isDarkMode ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-gray-800 border-gray-200';
  const typingBubbleBg = isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-500';
  const inputWrapBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200';
  const inputFieldBg = isDarkMode ? 'bg-slate-800 text-slate-100 placeholder:text-slate-400 focus:bg-slate-800' : 'bg-gray-100 text-gray-900 focus:bg-white';

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'USER',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    const abortController = new AbortController();
    loadingAbortRef.current = abortController;

    try {
      // Try multiple endpoints for compatibility
      let response;
      try {
        response = await axios.post(
          '/api/v1/ai-chat',
          { message: currentInput },
          {
            signal: abortController.signal,
            timeout: 20000,
          }
        );
      } catch (err) {
        // Fallback to alternative endpoint
        console.log('[ChatWidget] Trying alternative AI endpoint...');
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          { message: currentInput },
          {
            signal: abortController.signal,
            timeout: 20000,
          }
        );
      }

      if (response.data?.reply) {
        const botMsg: ChatMessage = {
          id: Date.now().toString(),
          text: response.data.reply,
          sender: 'BOT',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      if (axios.isCancel(err)) return;
      
      console.error('[ChatWidget] Error:', err);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        text: 'BiblioBot đang bận sắp xếp sách, bạn thử lại sau nhé! 😅 (Tip: Hãy thử ghi ngắn gọn hơn hoặc hỏi về thể loại sách 📚)',
        sender: 'BOT',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      loadingAbortRef.current = null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-h-screen max-w-screen">
      {/* Chat Window */}
      {isOpen && (
        <div className={`w-80 sm:w-96 md:w-96 max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border mb-4 transition-all duration-300 ease-in-out backdrop-blur-md ${panelBg}`}>
          {/* Header */}
          <div
            style={{ backgroundColor: colorScheme.primary }}
            className="p-4 text-white flex justify-between items-center shadow-md"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-white p-1.5 rounded-full" style={{ color: colorScheme.primary }}>
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{botTitle}</h3>
                <p className="text-xs opacity-80">{colorScheme.text}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="opacity-80 hover:opacity-100 transition-opacity"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className={`flex-1 p-3 sm:p-4 min-h-80 max-h-80 overflow-y-auto overflow-x-hidden flex flex-col space-y-3 ${messagesBg}`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'} min-w-0`}
              >
                <div
                  style={
                    msg.sender === 'USER'
                      ? { backgroundColor: colorScheme.primary, color: 'white' }
                      : {}
                  }
                  className={`max-w-xs sm:max-w-sm break-words rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm shadow-md transition-all duration-200 overflow-hidden ${
                    msg.sender === 'USER'
                      ? 'rounded-br-none hover:shadow-lg'
                      : `${botBubbleBg} border rounded-bl-none hover:shadow-lg`
                  }`}
                >
                  {msg.sender === 'BOT' ? (
                    <div className="prose prose-sm max-w-none text-sm whitespace-pre-wrap break-words overflow-hidden">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-wrap break-words block">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`rounded-2xl rounded-bl-none px-4 py-3 shadow-md flex space-x-1 border ${typingBubbleBg}`}>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className={`p-3 sm:p-4 border-t flex items-center gap-2 transition-all ${inputWrapBg}`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className={`flex-1 min-w-0 text-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium ${inputFieldBg}`}
              style={{ outlineColor: colorScheme.primary }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{ backgroundColor: colorScheme.primary }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colorScheme.hover;
                e.currentTarget.style.boxShadow = `0 10px 15px -3px rgba(0, 0, 0, 0.1)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colorScheme.primary;
                e.currentTarget.style.boxShadow = 'none';
              }}
              className="text-white p-2 sm:p-2.5 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: colorScheme.primary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colorScheme.hover;
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0, 0, 0, 0.15)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colorScheme.primary;
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          className="text-white p-4 rounded-full shadow-2xl transition-all active:scale-95 flex items-center justify-center"
          title={`Open ${botTitle}`}
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
};

export default ChatWidget;
