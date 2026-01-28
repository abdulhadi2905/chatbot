
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { SearchResult } from '../types';

const SearchGrounding: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setAnswer('');
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      setAnswer(response.text || "No summary available.");
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedSources: SearchResult[] = chunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || "External Source",
          uri: c.web.uri
        }));
      setSources(extractedSources);
    } catch (error) {
      console.error(error);
      setAnswer("Search error: Could not fetch real-time data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto w-full space-y-8 overflow-y-auto">
      <div className="text-center space-y-2 mb-4">
        <h2 className="text-3xl font-black gradient-text">Smart Search Grounding</h2>
        <p className="text-gray-500 text-sm">Real-time facts, news, and data directly from Google Search.</p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass p-2 rounded-2xl border border-white/10 flex items-center gap-2">
          <i className="fas fa-search ml-4 text-gray-500"></i>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask about recent events, current weather, or complex facts..."
            className="flex-1 bg-transparent border-none outline-none p-3 text-gray-200 text-lg"
          />
          <button 
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-800 rounded w-1/2"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        </div>
      )}

      {answer && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="glass p-8 rounded-3xl border border-white/10 shadow-xl">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <i className="fas fa-brain"></i> AI Synthesis
            </h3>
            <div className="text-gray-200 leading-relaxed space-y-4 text-lg">
              {answer.split('\n').map((para, i) => para && <p key={i}>{para}</p>)}
            </div>
          </div>

          {sources.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Verification Sources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((src, i) => (
                  <a 
                    key={i} 
                    href={src.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 glass rounded-2xl border border-white/5 hover:border-indigo-500/50 hover:bg-white/5 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-link text-gray-600 group-hover:text-indigo-400"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-300 truncate">{src.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{src.uri}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!answer && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          {[
            { q: "Latest AI news 2024", icon: 'fa-bolt' },
            { q: "Current Tokyo weather", icon: 'fa-cloud' },
            { q: "Recent stock market trends", icon: 'fa-chart-line' }
          ].map((item, i) => (
            <button 
              key={i}
              onClick={() => { setQuery(item.q); handleSearch(); }}
              className="p-6 glass rounded-2xl border border-white/10 text-left hover:border-indigo-500/30 group transition-all"
            >
              <i className={`fas ${item.icon} mb-4 text-gray-600 group-hover:text-indigo-400`}></i>
              <p className="text-sm font-medium text-gray-400 group-hover:text-gray-200">{item.q}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchGrounding;
