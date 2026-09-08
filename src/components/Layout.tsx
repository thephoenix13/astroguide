import { useApp } from '../context/AppContext';
import { Home, MessageCircle, Clock, Sparkles, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user?.onboardingComplete) return <>{children}</>;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/face', icon: Sparkles, label: 'Face' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] to-[#1a1040] text-slate-200">
      <div className="max-w-lg mx-auto pb-20">
        {children}
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1040]/95 backdrop-blur-lg border-t border-purple-900/30 z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                  isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' : ''} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
