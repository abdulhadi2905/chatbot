
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm Aura, your intelligent creative companion. How can I help you build today?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are Aura, a world-class senior creative AI. You are helpful, precise, and articulate. Keep responses concise unless asked for detail.'
        }
      });

      const response = await chat.sendMessage({ message: input });
      const modelMsg: Message = { 
        role: 'model', 
        content: response.text || "I'm sorry, I couldn't generate a response.", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "System error: Failed to connect to Gemini API. Please try again.", 
        timestamp: Date.now() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full px-6 py-8">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-8 scroll-smooth pr-2"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-800 border border-white/10'
              }`}>
                <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'} text-xs`}></i>
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'glass text-gray-200 rounded-tl-none border border-white/5'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center">
                <i className="fas fa-robot text-xs text-indigo-400"></i>
              </div>
              <div className="px-4 py-3 rounded-2xl glass border border-white/5 rounded-tl-none">
                <div className="flex gap-1.5 h-4 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-auto">
        <div className="glass p-2 rounded-2xl border border-white/10 shadow-2xl flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your creative spark here..."
            className="flex-1 bg-transparent border-none outline-none resize-none px-3 py-2 text-sm text-gray-200 min-h-[44px] max-h-48 scrollbar-hide"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              input.trim() && !loading 
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-3 font-medium uppercase tracking-widest">
          Powered by Gemini 3.0 Experimental Flash Engine
        </p>
      </div>
    </div>
  );
};

export default AIChat;
