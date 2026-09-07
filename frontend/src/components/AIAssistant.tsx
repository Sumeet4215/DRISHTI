import React, { useState } from 'react';
import { Bot, Brain, Send, Sparkles, User } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  cited_projects?: string[];
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Welcome to **DRISHTI Project Intelligence Portal**. Query infrastructure project risks, cost overrun probabilities, schedule delay predictions, SHAP driver analysis, sector benchmarks, or priority review queues.\n\n*All findings are synthesized directly from MoSPI PAIMANA/OCMS verified project records.*'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const promptChips = [
    'Which projects are currently at critical risk?',
    'Show sector-wise delay risk comparison.',
    'Which projects should be prioritized for review?',
    'Summarize portfolio cost escalation.'
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.answer,
          cited_projects: res.cited_projects
        }
      ]);
      setLoading(false);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Apologies, failed to process query against project records.'
        }
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[650px]">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">
            DRISHTI Project Intelligence Query Portal
          </h2>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded bg-slate-950 text-emerald-400 font-semibold border border-emerald-800/80 font-mono">
          Database Ingestion Status: Verified (PAIMANA Records)
        </span>
      </div>

      {/* Prompt Chips */}
      <div className="py-3 border-b border-slate-800/60 flex flex-wrap gap-2">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{chip}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 text-xs ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-3.5 rounded-xl space-y-1 ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              <div
                className="prose prose-invert prose-xs max-w-none whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: formatMarkdownText(m.text) }}
              />
              {m.cited_projects && m.cited_projects.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 font-semibold">Cited Records:</span>
                  {m.cited_projects.map((p, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 font-mono border border-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-10">
            <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Querying PAIMANA project database...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Assistant about projects, delay drivers, or critical risks..."
          className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function formatMarkdownText(text: string): string {
  // Simple markdown conversion for bolding and code blocks
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-900 px-1 py-0.5 rounded text-emerald-400 font-mono text-[11px]">$1</code>');
}
