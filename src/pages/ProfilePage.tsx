import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Crown, Star, Calendar, MapPin, Clock, Shield, ChevronRight, Sparkles, Hand } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, logout, getAccuracyScore, predictions, events, faceReadings, palmReadings } = useApp();
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const score = getAccuracyScore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <div className="text-center py-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center mb-3 shadow-lg shadow-purple-500/20">
          <span className="text-3xl text-white font-bold">{user.fullName.charAt(0).toUpperCase()}</span>
        </div>
        <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
        <p className="text-slate-400 text-sm">{user.email}</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.plan === 'pro' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-slate-400 border border-white/10'
          }`}>
            {user.plan === 'pro' ? '⭐ Pro' : 'Free Plan'}
          </span>
        </div>
      </div>

      {/* Birth Details */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5 space-y-3">
        <h2 className="text-white font-semibold text-sm">Birth Details</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-purple-400" />
            <span className="text-slate-300">{new Date(user.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-purple-400" />
            <span className="text-slate-300">{user.birthTime}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-purple-400" />
            <span className="text-slate-300">{user.birthPlace}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-300">{score.percentage}%</p>
          <p className="text-xs text-slate-400 mt-1">Prediction Accuracy</p>
        </div>
        <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-300">{events.length}</p>
          <p className="text-xs text-slate-400 mt-1">Life Events</p>
        </div>
        <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-300">{predictions.length}</p>
          <p className="text-xs text-slate-400 mt-1">Predictions</p>
        </div>
        <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-300">{faceReadings.length}</p>
          <p className="text-xs text-slate-400 mt-1">Face Readings</p>
        </div>
        <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-300">{palmReadings.length}</p>
          <p className="text-xs text-slate-400 mt-1">Palm Readings</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl overflow-hidden">
        <button onClick={() => navigate('/chart')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-3">
            <Star size={18} className="text-amber-400" />
            <span className="text-white text-sm">Birth Chart</span>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
        <div className="border-t border-white/5" />
        <button onClick={() => navigate('/predictions')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-purple-400" />
            <span className="text-white text-sm">Predictions</span>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
        <div className="border-t border-white/5" />
        <button onClick={() => navigate('/timeline')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-emerald-400" />
            <span className="text-white text-sm">Life Timeline</span>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
        <div className="border-t border-white/5" />
        <button onClick={() => navigate('/face')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-indigo-400" />
            <span className="text-white text-sm">Face Reading</span>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
        <div className="border-t border-white/5" />
        <button onClick={() => navigate('/palm')} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all">
          <div className="flex items-center gap-3">
            <Hand size={18} className="text-orange-400" />
            <span className="text-white text-sm">Palm Reading</span>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Subscription */}
      {user.plan !== 'pro' && (
        <button
          onClick={() => setShowPricing(true)}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
        >
          <Crown size={20} />
          Upgrade to Pro
        </button>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 border border-red-800/30 text-red-400 rounded-xl text-sm hover:bg-red-500/10 flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        Sign Out
      </button>

      {/* Pricing Modal */}
      {showPricing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center">
          <div className="bg-[#1a1040] w-full max-w-lg rounded-t-2xl p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Upgrade to Pro</h2>
              <button onClick={() => setShowPricing(false)} className="text-slate-400 hover:text-white text-xl">×</button>
            </div>

            <div className="space-y-4">
              {/* Monthly Plan */}
              <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Monthly</h3>
                    <p className="text-slate-400 text-sm">Billed every month</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹299<span className="text-sm text-slate-400">/mo</span></p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-500">
                  Subscribe Monthly
                </button>
              </div>

              {/* Yearly Plan */}
              <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-4 relative">
                <div className="absolute -top-2 right-4 px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">
                  SAVE 44%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">Yearly</h3>
                    <p className="text-slate-400 text-sm">Billed annually</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹1,999<span className="text-sm text-slate-400">/yr</span></p>
                    <p className="text-xs text-amber-400">₹167/mo</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-400 hover:to-orange-400">
                  Subscribe Yearly
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <h3 className="text-white font-medium text-sm">Pro includes:</h3>
              {[
                'Unlimited chat history',
                'Unlimited face readings',
                'Full prediction tracking',
                'Complete life timeline',
                'Priority AI responses',
                'Advanced chart analysis'
              ].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <Shield size={14} className="text-emerald-400" />
                  {feature}
                </div>
              ))}
            </div>

            <p className="text-slate-500 text-xs text-center">
              Payment powered by Razorpay. Cancel anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
