
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const VoiceAssistant: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [transcript, setTranscript] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }

  const toggleConnection = async () => {
    if (active) {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (outputContextRef.current) outputContextRef.current.close();
      setActive(false);
      setStatus('Standby');
      return;
    }

    try {
      setStatus('Initializing...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are Aura's voice soul. Friendly, witty, and always ready to converse.",
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setStatus('Listening...');
            setActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `Model: ${msg.serverContent!.outputTranscription!.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-4), `You: ${msg.serverContent!.inputTranscription!.text}`]);
            }
            
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const buf = await decodeAudioData(decode(audioData), outputContextRef.current, 24000, 1);
              const source = outputContextRef.current.createBufferSource();
              source.buffer = buf;
              source.connect(outputContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buf.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error(e),
          onclose: () => setActive(false)
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setStatus('Error accessing mic');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 overflow-hidden bg-black/40">
      <div className="relative mb-12">
        {/* Dynamic Visualizer Ring */}
        <div className={`absolute inset-[-40px] rounded-full blur-3xl transition-opacity duration-1000 ${
          active ? 'bg-indigo-500/20 opacity-100' : 'bg-gray-500/0 opacity-0'
        }`}></div>
        
        <div className={`w-64 h-64 rounded-full border-2 flex items-center justify-center relative transition-all duration-700 ${
          active ? 'border-indigo-500/40 shadow-[0_0_80px_rgba(79,70,229,0.3)]' : 'border-white/10'
        }`}>
          {/* Pulsing circles */}
          {active && (
            <>
              <div className="absolute inset-4 rounded-full border border-indigo-500/30 animate-ping"></div>
              <div className="absolute inset-10 rounded-full border border-purple-500/20 animate-ping [animation-delay:400ms]"></div>
            </>
          )}
          
          <button 
            onClick={toggleConnection}
            className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 z-10 ${
              active ? 'bg-indigo-600 text-white shadow-2xl scale-105' : 'glass hover:bg-white/5 text-gray-400'
            }`}
          >
            <i className={`fas ${active ? 'fa-stop text-4xl' : 'fa-microphone text-5xl'} mb-4`}></i>
            <span className="text-sm font-black uppercase tracking-[0.2em]">{active ? 'Disconnect' : 'Start Session'}</span>
          </button>
        </div>
      </div>

      <div className="text-center space-y-4 max-w-md w-full">
        <h2 className={`text-2xl font-bold transition-colors ${active ? 'text-indigo-400' : 'text-gray-500'}`}>
          {status}
        </h2>
        
        <div className="glass p-6 rounded-2xl border border-white/5 w-full min-h-[160px] flex flex-col gap-2">
          {transcript.length > 0 ? (
            transcript.map((line, i) => (
              <p key={i} className={`text-xs text-left ${line.startsWith('You:') ? 'text-gray-400 italic' : 'text-indigo-200 font-medium'}`}>
                {line}
              </p>
            ))
          ) : (
            <p className="text-xs text-gray-600 text-center my-auto italic">
              Transcription will appear here during live conversation...
            </p>
          )}
        </div>
        
        <p className="text-[10px] text-gray-700 uppercase tracking-widest leading-relaxed">
          Low latency bidirectional audio stream via<br/>Gemini 2.5 Native Multimodal
        </p>
      </div>
    </div>
  );
};

export default VoiceAssistant;
