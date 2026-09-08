import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateAIResponse } from '../lib/ai';

interface VoiceAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceAgent({ isOpen, onClose }: VoiceAgentProps) {
  const { user, events, addChatMessage } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      setTranscript('');
      setResponse('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        handleUserSpeech(speechResult);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone permissions.');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser. Try Chrome or Edge.');
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleUserSpeech = (text: string) => {
    if (!user?.chartData) {
      setResponse('Please complete your birth chart first to use the voice agent.');
      return;
    }

    // Generate AI response
    const aiResponse = generateAIResponse(text, user, user.chartData, events);
    setResponse(aiResponse.text);

    // Add to chat history
    addChatMessage({ role: 'user', content: text });
    addChatMessage({ role: 'assistant', content: aiResponse.text });

    // Speak the response
    speakResponse(aiResponse.text);
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;

    // Clean text for speech (remove markdown, emojis, etc.)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_{1,2}/g, '')
      .replace(/[^\w\s.,!?']/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) ||
                          voices.find(v => v.lang.startsWith('en')) ||
                          voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    setError('');
    setTranscript('');
    setResponse('');

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Could not start listening. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border border-purple-700/50 rounded-2xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Volume2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Voice Guide</h2>
              <p className="text-slate-400 text-xs">Ask me anything about your chart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">You said:</p>
              <p className="text-white text-sm">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-2">Guide says:</p>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{response}</p>
            </div>
          )}

          {/* Empty state */}
          {!transcript && !response && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                <Mic size={32} className="text-purple-400" />
              </div>
              <p className="text-slate-300 text-sm mb-2">Tap the microphone to start</p>
              <p className="text-slate-500 text-xs">Ask about your chart, predictions, or life guidance</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 space-y-3">
          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 py-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-red-300 text-sm">Listening...</p>
            </div>
          )}

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 size={16} className="text-purple-400 animate-spin" />
              <p className="text-purple-300 text-sm">Speaking...</p>
            </div>
          )}

          {/* Main button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking}
            className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <>
                <MicOff size={20} />
                Stop Listening
              </>
            ) : (
              <>
                <Mic size={20} />
                Start Speaking
              </>
            )}
          </button>

          {/* Stop speaking button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-slate-300 text-sm transition-colors"
            >
              Stop Speaking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
