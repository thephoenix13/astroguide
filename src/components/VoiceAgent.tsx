import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Loader2, AlertCircle } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Send greeting when voice mode opens
      const greeting = "Hello! I'm your AI astrologer. How can I guide you today?";
      setResponse(greeting);
      
      // Speak the greeting after a short delay
      setTimeout(() => {
        speakResponse(greeting);
      }, 500);
    } else {
      stopListening();
      stopSpeaking();
      setTranscript('');
      setResponse('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      setError('');
      
      // Get Deepgram API key from localStorage
      const key = localStorage.getItem('DEEPGRAM_API_KEY');
      
      if (!key) {
        throw new Error('Deepgram API key not configured. Please add it in Profile settings.');
      }
      
      // Get microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = mediaStream;

      // Create WebSocket connection to Deepgram
      const ws = new WebSocket(
        'wss://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&punctuate=true&interim_results=true&endpointing=300&utterance_end_ms=1000',
        ['token', key]
      );
      
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Deepgram WebSocket connected');
        setIsListening(true);
        
        // Set up audio streaming
        const audioContext = new AudioContext({ sampleRate: 44100 });
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(mediaStream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
          }
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(pcmData.buffer);
          }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'Results') {
            const transcript = data.channel.alternatives[0].transcript;
            
            if (transcript) {
              setTranscript(transcript);
              
              // If this is a final result
              if (data.is_final && transcript.trim()) {
                handleUserSpeech(transcript);
              }
            }
          } else if (data.type === 'UtteranceEnd') {
            // Utterance ended
            if (transcript.trim()) {
              handleUserSpeech(transcript);
            }
          }
        } catch (err) {
          console.error('Error parsing Deepgram message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Voice recognition error. Please try again.');
        setIsListening(false);
      };

      ws.onclose = () => {
        console.log('Deepgram WebSocket closed');
        setIsListening(false);
      };

    } catch (err: any) {
      console.error('Error starting voice recognition:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else if (err.message.includes('Deepgram API key not configured')) {
        setError('Deepgram API key not configured. Please go to Profile settings and add your API key.');
      } else {
        setError(`Error: ${err.message}`);
      }
    }
  };

  const stopListening = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setIsListening(false);
  };

  const handleUserSpeech = (text: string) => {
    if (!user?.chartData) {
      setResponse('Please complete your birth chart first to use the voice agent.');
      speakResponse('Please complete your birth chart first to use the voice agent.');
      return;
    }

    setIsProcessing(true);
    setTranscript(text);

    // Generate AI response
    const aiResponse = generateAIResponse(text, user, user.chartData, events);
    setResponse(aiResponse.text);

    // Add to chat history
    addChatMessage({ role: 'user', content: text });
    addChatMessage({ role: 'assistant', content: aiResponse.text });

    // Speak the response
    setTimeout(() => {
      speakResponse(aiResponse.text);
      setIsProcessing(false);
    }, 500);
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;

    // Clean text for speech (remove markdown, emojis, etc.)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/_{1,}/g, '')
      .replace(/[🌟💫✨🌙⭐🔮]/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a good voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border border-indigo-700/50 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 flex items-center justify-center">
              <Mic size={20} className="text-indigo-300" />
            </div>
            <h2 className="text-xl font-bold text-white">Voice Mode</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Transcript */}
          {transcript && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-2">You said:</p>
              <p className="text-white text-sm">{transcript}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2 text-indigo-300">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-2">AI Response:</p>
              <p className="text-white text-sm whitespace-pre-line">{response}</p>
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-emerald-300">
              <Volume2 size={16} className="animate-pulse" />
              <span className="text-sm">Speaking...</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-6 flex-shrink-0">
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isSpeaking || isProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isListening ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </button>
        </div>

        {/* Instructions */}
        <p className="text-center text-slate-400 text-xs mt-4 flex-shrink-0">
          {isListening
            ? 'Listening... Speak now'
            : isSpeaking
            ? 'AI is speaking...'
            : 'Tap the microphone to start'}
        </p>
      </div>
    </div>
  );
}
