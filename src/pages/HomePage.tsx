import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getDailyTransitReading } from '../lib/astrology';
import { Sparkles, Calendar, TrendingUp, Star, Hand, GitCompareArrows, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const { user, readings, addReading, predictions, events } = useApp();
  const navigate = useNavigate();
  const [todayReading, setTodayReading] = useState<string>('');
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (!user?.chartData) return;
    const today = new Date().toISOString().split('T')[0];
    const existingReading = readings.find(r => r.date === today);
    
    if (existingReading) {
      setTodayReading(existingReading.content);
      setSummary(existingReading.summary);
    } else {
      const { content, summary: sum } = getDailyTransitReading(user.chartData);
      setTodayReading(content);
      setSummary(sum);
      addReading({ date: today, content, summary: sum });
    }
  }, [user]);

  const pendingPredictions = predictions.filter(p => p.status === 'pending').length;
  const recentEvents = events.slice(-3).reverse();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Namaste, {user?.fullName?.split(' ')[0] || 'Seeker'} ✨
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => navigate('/chart')} className="bg-white/5 border border-purple-800/20 rounded-xl p-3 text-center hover:bg-white/10 transition-all">
          <Calendar size={18} className="text-purple-400 mx-auto mb-1" />
          <p className="text-xs text-slate-300">Chart</p>
        </button>
        <button onClick={() => navigate('/predictions')} className="bg-white/5 border border-purple-800/20 rounded-xl p-3 text-center hover:bg-white/10 transition-all">
          <TrendingUp size={18} className="text-amber-400 mx-auto mb-1" />
          <p className="text-xs text-slate-300">{pendingPredictions} Pending</p>
        </button>
        <button onClick={() => navigate('/timeline')} className="bg-white/5 border border-purple-800/20 rounded-xl p-3 text-center hover:bg-white/10 transition-all">
          <Star size={18} className="text-emerald-400 mx-auto mb-1" />
          <p className="text-xs text-slate-300">{events.length} Events</p>
        </button>
      </div>

      {/* Daily Reading */}
      <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-lg">🌙</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Today's Reading</h2>
        </div>
        <p className="text-amber-300 text-sm font-medium mb-3">{summary}</p>
        <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
          {todayReading.split('\n\n').slice(0, 3).join('\n\n')}
        </div>
      </div>

      {/* Chart Summary */}
      {user?.chartData && (
        <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Your Chart at a Glance</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Lagna</p>
              <p className="text-white font-medium">{user.chartData.lagna.sign}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Moon Sign</p>
              <p className="text-white font-medium">{user.chartData.planets.find(p => p.planet === 'Moon')?.sign}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Mahadasha</p>
              <p className="text-white font-medium">{user.chartData.mahadasha.planet}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-slate-400 text-xs">Nakshatra</p>
              <p className="text-white font-medium">{user.chartData.moonNakshatra}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-3">Recent Life Events</h2>
          <div className="space-y-2">
            {recentEvents.map(event => (
              <div key={event.id} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-white">{event.title}</p>
                  <p className="text-slate-500 text-xs">{new Date(event.eventDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Readings Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Divine Readings</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/face')}
            className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-2xl p-4 text-left hover:border-purple-500/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
              <Sparkles size={18} className="text-purple-300" />
            </div>
            <p className="text-white font-medium text-sm">Face Reading</p>
            <p className="text-slate-500 text-xs mt-1">Mukha Shastra</p>
          </button>
          <button
            onClick={() => navigate('/palm')}
            className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/30 rounded-2xl p-4 text-left hover:border-amber-500/50 transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-3">
              <Hand size={18} className="text-amber-300" />
            </div>
            <p className="text-white font-medium text-sm">Palm Reading</p>
            <p className="text-slate-500 text-xs mt-1">Hasta Samudrika</p>
          </button>
        </div>
      </div>

      {/* Holistic Comparison CTA */}
      <button
        onClick={() => navigate('/compare')}
        className="w-full bg-gradient-to-r from-purple-600/20 via-amber-500/20 to-orange-500/20 border border-purple-700/20 rounded-2xl p-5 text-left hover:border-purple-500/40 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-amber-500/30 flex items-center justify-center flex-shrink-0">
            <GitCompareArrows size={22} className="text-amber-300" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Holistic Comparison</p>
            <p className="text-slate-400 text-xs mt-0.5">See how your Chart, Face & Palm readings align</p>
          </div>
          <ChevronRight size={18} className="text-slate-500" />
        </div>
      </button>

      {/* CTA */}
      <button
        onClick={() => navigate('/chat')}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
      >
        <Sparkles size={18} />
        Ask Your AI Guide
      </button>
    </div>
  );
}
