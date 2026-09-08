import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Plus, Check, X, Minus, TrendingUp, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PredictionsPage() {
  const { predictions, updatePredictionStatus, addPrediction, getAccuracyScore } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accurate' | 'partial' | 'missed'>('all');

  const score = getAccuracyScore();
  const filtered = filter === 'all' ? predictions : predictions.filter(p => p.status === filter);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addPrediction({
      text: newText,
      category: newCategory,
      dateMade: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setNewText('');
    setShowForm(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft size={20} className="text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-white">Predictions</h1>
      </div>

      {/* Accuracy Score */}
      <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/20 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Accuracy Score</p>
            <p className="text-3xl font-bold text-amber-300">{score.percentage}%</p>
            <p className="text-slate-500 text-xs mt-1">{score.accurate} accurate out of {score.total} resolved</p>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-amber-500/30 flex items-center justify-center">
            <TrendingUp size={24} className="text-amber-400" />
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
            style={{ width: `${score.percentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'accurate', 'partial', 'missed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && ` (${predictions.filter(p => p.status === 'pending').length})`}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-3 border border-dashed border-purple-700/30 rounded-xl text-purple-300 text-sm hover:bg-white/5 flex items-center justify-center gap-2"
      >
        <Plus size={16} />
        Add Manual Prediction
      </button>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4 space-y-3">
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Enter your prediction..."
            className="w-full px-3 py-2 bg-white/5 border border-purple-800/30 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 resize-none h-20"
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-purple-800/30 rounded-lg text-white text-sm focus:outline-none"
          >
            <option value="career">Career</option>
            <option value="love">Love</option>
            <option value="health">Health</option>
            <option value="finance">Finance</option>
            <option value="general">General</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-purple-800/30 rounded-lg text-slate-300 text-sm">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm font-medium">Save</button>
          </div>
        </div>
      )}

      {/* Predictions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No predictions yet</p>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-white text-sm">{p.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">{new Date(p.dateMade).toLocaleDateString()}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-purple-400">{p.category}</span>
                  </div>
                </div>
              </div>
              
              {/* Status Actions */}
              <div className="flex gap-2 mt-3">
                {p.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updatePredictionStatus(p.id, 'accurate')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs hover:bg-emerald-500/30"
                    >
                      <Check size={12} /> Accurate
                    </button>
                    <button
                      onClick={() => updatePredictionStatus(p.id, 'partial')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-300 rounded-lg text-xs hover:bg-amber-500/30"
                    >
                      <Minus size={12} /> Partial
                    </button>
                    <button
                      onClick={() => updatePredictionStatus(p.id, 'missed')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg text-xs hover:bg-red-500/30"
                    >
                      <X size={12} /> Missed
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    p.status === 'accurate' ? 'bg-emerald-500/20 text-emerald-300' :
                    p.status === 'partial' ? 'bg-amber-500/20 text-amber-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {p.status === 'accurate' ? '✓ Accurate' : p.status === 'partial' ? '~ Partial' : '✗ Missed'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
