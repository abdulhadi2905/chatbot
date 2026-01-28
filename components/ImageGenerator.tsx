
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedImage } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: aspectRatio as any } }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          setImages(prev => [{ url, prompt, timestamp: Date.now() }, ...prev]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      {/* Settings Panel */}
      <div className="lg:col-span-3 glass border-r border-white/5 p-6 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Model Settings</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <label className="text-xs font-semibold text-gray-500 block mb-2">ASPECT RATIO</label>
              <div className="grid grid-cols-2 gap-2">
                {['1:1', '16:9', '9:16', '3:4', '4:3'].map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      aspectRatio === ratio 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">History</h3>
          <div className="space-y-3">
            {images.slice(0, 5).map((img, i) => (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden glass border border-white/10">
                <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <p className="text-[10px] line-clamp-2 text-center text-white">{img.prompt}</p>
                </div>
              </div>
            ))}
            {images.length === 0 && <p className="text-xs text-gray-600 italic">No images yet</p>}
          </div>
        </div>
      </div>

      {/* Main Preview */}
      <div className="lg:col-span-9 p-8 flex flex-col gap-6 overflow-y-auto">
        <div className="relative group max-w-2xl mx-auto w-full">
          <div className="glass p-3 rounded-2xl border border-white/10 shadow-2xl">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cybernetic tiger in a neon Tokyo alleyway, cinematic lighting, 8k resolution..."
                className="w-full bg-transparent border-none outline-none resize-none p-4 text-gray-200 min-h-[100px] text-lg leading-relaxed"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={`absolute bottom-3 right-3 px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl ${
                  loading || !prompt.trim() 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30'
                }`}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Manifesting...</>
                ) : (
                  <><i className="fas fa-wand-magic-sparkles"></i> Generate</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[400px] flex items-center justify-center">
          {images.length > 0 ? (
            <div className="relative group max-w-2xl w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
              <img src={images[0].url} className="w-full h-full object-contain bg-black/20" alt="Generated result" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = images[0].url;
                    link.download = `aura-gen-${Date.now()}.png`;
                    link.click();
                  }}
                  className="w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <i className="fas fa-download"></i>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-sm font-medium text-white/90">{images[0].prompt}</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-3xl glass border border-white/10 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-image text-4xl text-gray-700"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-500">Your vision starts here</h2>
              <p className="text-gray-600 max-w-xs mx-auto">Enter a prompt and watch Aura bring your imagination to life.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
