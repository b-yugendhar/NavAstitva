import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, t, speakText, isSpeaking, stopSpeaking, isListening, startListening, stopListening } = useLanguage();
  const { currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language,
          role: currentUser?.role || 'worker'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.reply);
        // Automatically speak aloud in the current language
        speakText(data.reply);
      } else {
        setResponse('Sorry, an error occurred while generating the assistant reply.');
      }
    } catch (e) {
      setResponse('Could not connect to AI assistant service.');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    { text: 'How do I upload evidence for my vocational trade skill?', langLabel: 'Skills & Evidence' },
    { text: 'How is the Trust Score calculated?', langLabel: 'Trust Score' },
    { text: 'How does escrow milestone payment protection work?', langLabel: 'Payments' },
    { text: 'How do I register through a CSC village center without a smartphone?', langLabel: 'CSC Access' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-700 to-orange-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Bot className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">NavAstitva Voice & Multilingual Assistant</h3>
              <p className="text-xs text-purple-100">Powered by Gemini AI • 9 Indian Languages</p>
            </div>
          </div>
          <button 
            onClick={() => {
              stopSpeaking();
              stopListening();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-200/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-950">
              Speak or type in your language. The assistant answers clearly and will read the response aloud to support low-literacy workers.
            </div>
          </div>

          {/* Quick Suggestions */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Common Questions
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(q.text);
                    handleAsk(q.text);
                  }}
                  className="text-xs bg-slate-100 hover:bg-purple-50 hover:text-purple-800 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors text-left cursor-pointer"
                >
                  <span className="font-semibold text-purple-700 mr-1">[{q.langLabel}]</span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Assistant Answer Box */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3 text-slate-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <span>Thinking in your selected language...</span>
            </div>
          )}

          {response && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> AI Audio Guidance
                </span>
                <button
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(response)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-white text-purple-800 border border-purple-300 shadow-2xs hover:bg-purple-100 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Stop Audio' : 'Listen Again'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {response}
              </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening((transcript) => {
                  setPrompt(transcript);
                  handleAsk(transcript);
                });
              }
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isListening 
                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to speak via microphone'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-orange-600" />}
          </button>

          <input
            type="text"
            placeholder="Type or speak in your language..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAsk();
            }}
            className="flex-1 bg-white border border-slate-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={isLoading || !prompt.trim()}
            className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
