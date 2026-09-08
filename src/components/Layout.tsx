import { useApp } from '../context/AppContext';
import { Home, MessageCircle, Sparkles, User, Hand, GitCompareArrows, Sun, Moon, Mic } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { VoiceAgent } from './VoiceAgent';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);

  if (!user?.onboardingComplete) return <>{children}</>;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/compare', icon: GitCompareArrows, label: 'Compare' },
    { path: '/face', icon: Sparkles, label: 'Face' },
    { path: '/palm', icon: Hand, label: 'Palm' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] to-[#1a1040] text-slate-200">
      <div className="max-w-lg mx-auto pb-20">
        {children}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all shadow-lg"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-300" />
          ) : (
            <Moon size={18} className="text-indigo-300" />
          )}
        </button>

        {/* Voice Agent */}
        <button
          onClick={() => setVoiceAgentOpen(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 backdrop-blur-md border border-indigo-400/30 flex items-center justify-center hover:from-indigo-500/50 hover:to-pink-500/50 transition-all shadow-lg"
          title="Voice Mode"
        >
          <Mic size={18} className="text-indigo-300" />
        </button>
      </div>

      {/* Voice Agent Modal */}
      <VoiceAgent isOpen={voiceAgentOpen} onClose={() => setVoiceAgentOpen(false)} />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1040]/95 backdrop-blur-lg border-t border-purple-900/30 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' : ''} />
                <span className="text-[9px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
