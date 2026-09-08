import { useApp } from '../context/AppContext';
import { Clock, Star, Bookmark, Calendar } from 'lucide-react';

export function TimelinePage() {
  const { events, predictions, readings } = useApp();

  type TimelineItem = {
    id: string;
    type: 'event' | 'prediction' | 'reading';
    date: string;
    title: string;
    description: string;
    icon: typeof Clock;
    color: string;
    status?: string;
  };

  const items: TimelineItem[] = [
    ...events.map(e => ({
      id: e.id,
      type: 'event' as const,
      date: e.eventDate,
      title: e.title,
      description: e.description || e.category,
      icon: Star,
      color: 'text-emerald-400',
    })),
    ...predictions.map(p => ({
      id: p.id,
      type: 'prediction' as const,
      date: p.dateMade,
      title: `Prediction: ${p.text.substring(0, 50)}...`,
      description: p.text,
      icon: Bookmark,
      color: 'text-amber-400',
      status: p.status,
    })),
    ...readings.map(r => ({
      id: r.id,
      type: 'reading' as const,
      date: r.date,
      title: 'Daily Reading',
      description: r.summary,
      icon: Calendar,
      color: 'text-purple-400',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Life Timeline</h1>
        <p className="text-slate-400 text-sm mt-1">Your cosmic journey, chronologically</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-900/20 border border-emerald-700/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-emerald-300">{events.length}</p>
          <p className="text-xs text-slate-400">Events</p>
        </div>
        <div className="bg-amber-900/20 border border-amber-700/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-300">{predictions.length}</p>
          <p className="text-xs text-slate-400">Predictions</p>
        </div>
        <div className="bg-purple-900/20 border border-purple-700/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-300">{readings.length}</p>
          <p className="text-xs text-slate-400">Readings</p>
        </div>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Your timeline is empty.</p>
          <p className="text-slate-500 text-sm mt-1">Add life events and chat predictions to see them here.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-amber-500/50 to-emerald-500/50" />
          
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="relative pl-12">
                {/* Dot */}
                <div className={`absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 ${
                  item.type === 'event' ? 'bg-emerald-500 border-emerald-300' :
                  item.type === 'prediction' ? 'bg-amber-500 border-amber-300' :
                  'bg-purple-500 border-purple-300'
                }`} />
                
                {/* Card */}
                <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <item.icon size={14} className={item.color} />
                      <span className="text-xs text-slate-500 uppercase tracking-wide">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-white font-medium mt-2 text-sm">{item.title}</h3>
                  {item.description && item.description !== item.title && (
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{item.description}</p>
                  )}
                  {item.status && (
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                      item.status === 'accurate' ? 'bg-emerald-500/20 text-emerald-300' :
                      item.status === 'partial' ? 'bg-amber-500/20 text-amber-300' :
                      item.status === 'missed' ? 'bg-red-500/20 text-red-300' :
                      'bg-slate-500/20 text-slate-300'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
