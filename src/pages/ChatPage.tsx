import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateAIResponse } from '../lib/ai';
import { Send, Sparkles, Trash2, BookmarkPlus, Plus, X } from 'lucide-react';

export function ChatPage() {
  const { user, chatHistory, addChatMessage, clearChat, addPrediction, events, addEvent } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventCategory, setEventCategory] = useState<'career' | 'love' | 'health' | 'spiritual' | 'family' | 'finance' | 'other'>('other');
  const [eventDesc, setEventDesc] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !user?.chartData) return;
    
    const userMessage = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: userMessage });
    setIsTyping(true);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const { text, hasPrediction, predictionText } = generateAIResponse(
      userMessage,
      user,
      user.chartData,
      events
    );

    addChatMessage({ role: 'assistant', content: text });
    setIsTyping(false);

    // Store prediction text for the log button
    if (hasPrediction && predictionText) {
      setLastPrediction(predictionText);
    }
  };

  const [lastPrediction, setLastPrediction] = useState<string | null>(null);

  const handleLogPrediction = () => {
    if (!lastPrediction) return;
    addPrediction({
      text: lastPrediction,
      category: 'general',
      dateMade: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setLastPrediction(null);
  };

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !eventDate) return;
    addEvent({
      title: eventTitle,
      description: eventDesc,
      eventDate,
      category: eventCategory
    });
    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    setEventCategory('other');
    setShowEventForm(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-800/20 bg-[#0f0a1e]/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">AI Astro Guide</h1>
            <p className="text-emerald-400 text-xs">Online • {events.length} memories</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEventForm(true)}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
            title="Add life event"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={clearChat}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400"
            title="Clear chat"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center">
          <div className="bg-[#1a1040] w-full max-w-lg rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Add Life Event</h3>
              <button onClick={() => setShowEventForm(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={eventTitle}
              onChange={e => setEventTitle(e.target.value)}
              placeholder="Event title (e.g., Started new job)"
              className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <input
              type="date"
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white focus:outline-none focus:border-purple-500"
            />
            <select
              value={eventCategory}
              onChange={e => setEventCategory(e.target.value as typeof eventCategory)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white focus:outline-none focus:border-purple-500"
            >
              <option value="career">Career</option>
              <option value="love">Love & Relationships</option>
              <option value="health">Health</option>
              <option value="spiritual">Spiritual</option>
              <option value="family">Family</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={eventDesc}
              onChange={e => setEventDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none h-20"
            />
            <button
              onClick={handleAddEvent}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl"
            >
              Save Event
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔮</div>
            <h3 className="text-white font-semibold mb-2">Start a Conversation</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Ask about your career, relationships, health, or any life question. I remember your life events and chart.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['How is my career going?', 'Tell me about love', 'Health guidance', 'What does today hold?'].map(q => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="px-3 py-1.5 bg-white/5 border border-purple-800/20 rounded-full text-xs text-slate-300 hover:bg-white/10"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-md'
                : 'bg-white/10 text-slate-200 rounded-bl-md'
            }`}>
              <div className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-slate-500'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Log Prediction Button */}
        {lastPrediction && (
          <div className="flex justify-center">
            <button
              onClick={handleLogPrediction}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm hover:bg-amber-500/30 transition-all"
            >
              <BookmarkPlus size={16} />
              Log this prediction
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-800/20 bg-[#0f0a1e]/80 backdrop-blur-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your life, chart, or predictions..."
            className="flex-1 px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl disabled:opacity-50 hover:from-purple-500 hover:to-purple-600 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
