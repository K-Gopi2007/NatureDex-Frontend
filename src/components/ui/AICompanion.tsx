import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { fetchWithAuth } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export default function AICompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'ai', text: 'Hello! I am your NatureDex Companion. Ask me anything about nature or specific species!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const handleCelebrate = async (e: CustomEvent) => {
      const speciesName = e.detail?.species_name;
      if (!speciesName) return;
      
      setIsOpen(true);
      setIsTyping(true);
      
      try {
        const res = await fetchWithAuth('/companion/celebrate', {
          method: 'POST',
          body: JSON.stringify({ species_name: speciesName })
        });
        if (res.ok) {
          const data = await res.json();
          const aiMsg: Message = { id: Date.now().toString(), sender: 'ai', text: data.answer };
          setMessages(prev => [...prev, aiMsg]);
          speak(data.answer);
        }
      } catch (err) {
        console.error("Celebration failed", err);
      } finally {
        setIsTyping(false);
      }
    };

    window.addEventListener('naturedex:celebrate' as any, handleCelebrate);
    return () => window.removeEventListener('naturedex:celebrate' as any, handleCelebrate);
  }, [voiceEnabled]);

  const speak = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Natural')) || voices[0];
    if (goodVoice) utterance.voice = goodVoice;
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: userText };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Find context if available
      let speciesContext = undefined;
      const existing = localStorage.getItem('naturedex_discoveries');
      if (existing) {
        const discoveries = JSON.parse(existing);
        if (discoveries.length > 0) {
           speciesContext = discoveries[0].name;
        }
      }

      const res = await fetchWithAuth('/companion/ask', {
        method: 'POST',
        body: JSON.stringify({ 
           question: userText,
           species_context: speciesContext
        })
      });
      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: data.answer };
        setMessages(prev => [...prev, aiMsg]);
        speak(data.answer);
      } else {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Oops! Something went wrong.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Oops! I lost connection to the server.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-black/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl w-80 sm:w-96 h-96 mb-4 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-emerald-900/40 border-b border-emerald-500/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <h3 className="font-bold text-white text-sm">NatureDex Companion</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)} 
                className="text-gray-400 hover:text-emerald-400 transition"
              >
                {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-gray-800 text-gray-200 border border-emerald-500/20 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-emerald-500/20 p-3 rounded-2xl rounded-bl-none flex gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-emerald-500/20 bg-black/50 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nature..." 
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full shadow-lg shadow-emerald-900/50 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 relative group"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-emerald-400 blur-md opacity-40 group-hover:opacity-70 transition-opacity"></div>
        <Sparkles size={24} className="relative z-10 animate-pulse" />
      </button>
    </div>
  );
}
