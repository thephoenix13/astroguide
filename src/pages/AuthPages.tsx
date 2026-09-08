import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, Star } from 'lucide-react';

export function AuthPage() {
  const { login, signup } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const success = login(email, password);
      if (!success) setError('Invalid credentials');
    } else {
      if (!fullName.trim()) { setError('Please enter your name'); return; }
      const success = signup(email, password, fullName);
      if (!success) setError('Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] via-[#1a1040] to-[#0f0a1e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">
            Astro-Guide
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Your AI Life Companion</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-purple-800/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-amber-400 hover:text-amber-300 font-medium">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Features */}
        <div className="mt-8 space-y-3">
          {['Birth Chart & Daily Readings', 'AI Chat with Persistent Memory', 'Face Reading (Mukha Shastra)', 'Prediction Tracking'].map(feature => (
            <div key={feature} className="flex items-center gap-3 text-sm text-slate-400">
              <Star size={14} className="text-amber-400 flex-shrink-0" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const steps = [
    {
      title: "Welcome to your cosmic journey",
      subtitle: "Let's set up your birth details for accurate readings",
      content: (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌟</div>
          <p className="text-slate-300">We'll use your birth details to compute your Vedic birth chart, daily readings, and personalized guidance.</p>
        </div>
      )
    },
    {
      title: "When were you born?",
      subtitle: "Date of birth",
      content: (
        <div className="py-4">
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-purple-800/30 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500"
            max={new Date().toISOString().split('T')[0]}
          />
          <p className="text-slate-400 text-sm mt-2">This determines your planetary positions</p>
        </div>
      )
    },
    {
      title: "What time?",
      subtitle: "Time of birth (as accurate as possible)",
      content: (
        <div className="py-4">
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-purple-800/30 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500"
          />
          <p className="text-slate-400 text-sm mt-2">Exact time helps determine your Ascendant (Lagna)</p>
        </div>
      )
    },
    {
      title: "Where were you born?",
      subtitle: "City and country",
      content: (
        <div className="py-4">
          <input
            type="text"
            value={birthPlace}
            onChange={e => setBirthPlace(e.target.value)}
            className="w-full px-4 py-4 bg-white/5 border border-purple-800/30 rounded-xl text-white text-lg focus:outline-none focus:border-purple-500"
            placeholder="e.g., Mumbai, India"
          />
          <p className="text-slate-400 text-sm mt-2">Location affects house calculations</p>
        </div>
      )
    }
  ];

  const canProceed = step === 0 || (step === 1 && birthDate) || (step === 2 && birthTime) || (step === 3 && birthPlace);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding(birthDate, birthTime, birthPlace);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] via-[#1a1040] to-[#0f0a1e] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-purple-500 to-amber-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h2>
        <p className="text-slate-400 mb-6">{steps[step].subtitle}</p>
        
        {steps[step].content}

        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-purple-800/30 rounded-xl text-slate-300 hover:bg-white/5"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step === steps.length - 1 ? 'Generate My Chart' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
