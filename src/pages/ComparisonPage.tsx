import { useApp } from '../context/AppContext';
import { Star, Sparkles, Hand, TrendingUp, Heart, Brain, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ComparisonPage() {
  const { user, faceReadings, palmReadings } = useApp();
  const navigate = useNavigate();

  const chart = user?.chartData;
  const latestFace = faceReadings[faceReadings.length - 1];
  const latestPalm = palmReadings[palmReadings.length - 1];

  // Extract key traits from each modality
  const chartTraits = chart ? extractChartTraits(chart) : null;
  const faceTraits = latestFace ? extractFaceTraits(latestFace.measurements) : null;
  const palmTraits = latestPalm ? extractPalmTraits(latestPalm.measurements) : null;

  // Find common themes
  const commonThemes = findCommonThemes(chartTraits, faceTraits, palmTraits);

  if (!chart) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
            <Star size={32} className="text-purple-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm mb-6">
            To see your holistic comparison, please complete your birth chart first.
          </p>
          <button
            onClick={() => navigate('/chart')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium"
          >
            View Birth Chart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Holistic Comparison</h1>
        <p className="text-slate-400 text-sm mt-1">
          Synthesis of your Chart, Face & Palm readings
        </p>
      </div>

      {/* Completion Status */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-4">
        <h2 className="text-white font-semibold text-sm mb-3">Reading Completion</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-400" />
              <span className="text-slate-300 text-sm">Birth Chart</span>
            </div>
            <span className="text-emerald-400 text-xs font-medium">✓ Complete</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              <span className="text-slate-300 text-sm">Face Reading</span>
            </div>
            {latestFace ? (
              <span className="text-emerald-400 text-xs font-medium">✓ Complete</span>
            ) : (
              <button
                onClick={() => navigate('/face')}
                className="text-purple-400 text-xs font-medium hover:text-purple-300"
              >
                Add Reading →
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hand size={16} className="text-orange-400" />
              <span className="text-slate-300 text-sm">Palm Reading</span>
            </div>
            {latestPalm ? (
              <span className="text-emerald-400 text-xs font-medium">✓ Complete</span>
            ) : (
              <button
                onClick={() => navigate('/palm')}
                className="text-orange-400 text-xs font-medium hover:text-orange-300"
              >
                Add Reading →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Common Themes */}
      {commonThemes.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">Common Themes</h2>
          </div>
          <div className="space-y-3">
            {commonThemes.map((theme, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {theme.icon}
                  <h3 className="text-white font-medium text-sm">{theme.title}</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{theme.description}</p>
                <div className="flex gap-2 mt-3">
                  {theme.sources.map((source, j) => (
                    <span
                      key={j}
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        source === 'Chart'
                          ? 'bg-amber-500/20 text-amber-300'
                          : source === 'Face'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-orange-500/20 text-orange-300'
                      }`}
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Insights */}
      <div className="space-y-4">
        {/* Chart Insights */}
        {chartTraits && (
          <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} className="text-amber-400" />
              <h2 className="text-white font-semibold">Birth Chart Insights</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Core Nature:</span>
                <span className="text-white">{chartTraits.coreNature}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emotional Style:</span>
                <span className="text-white">{chartTraits.emotionalStyle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Life Path:</span>
                <span className="text-white">{chartTraits.lifePath}</span>
              </div>
            </div>
          </div>
        )}

        {/* Face Insights */}
        {faceTraits && (
          <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-purple-400" />
              <h2 className="text-white font-semibold">Face Reading Insights</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Intellect:</span>
                <span className="text-white">{faceTraits.intellect}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Empathy:</span>
                <span className="text-white">{faceTraits.empathy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Determination:</span>
                <span className="text-white">{faceTraits.determination}</span>
              </div>
            </div>
          </div>
        )}

        {/* Palm Insights */}
        {palmTraits && (
          <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Hand size={18} className="text-orange-400" />
              <h2 className="text-white font-semibold">Palm Reading Insights</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Vitality:</span>
                <span className="text-white">{palmTraits.vitality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emotional Depth:</span>
                <span className="text-white">{palmTraits.emotionalDepth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mental Clarity:</span>
                <span className="text-white">{palmTraits.mentalClarity}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Holistic Summary */}
      {chartTraits && faceTraits && palmTraits && (
        <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-700/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Zap size={18} className="text-amber-300" />
            </div>
            <h2 className="text-lg font-semibold text-white">Holistic Summary</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Your readings reveal a fascinating integration of energies. Your birth chart shows 
            {chartTraits.coreNature.toLowerCase()}, while your face reflects {faceTraits.intellect.toLowerCase()} and 
            your palm indicates {palmTraits.vitality.toLowerCase()}. This combination suggests you are someone who 
            {generateSynthesis(chartTraits, faceTraits, palmTraits)}.
          </p>
          <p className="text-slate-400 text-xs mt-3 italic">
            Remember: These readings are guides, not destinations. Your free will and choices shape your true path.
          </p>
        </div>
      )}

      {/* Missing Readings Prompt */}
      {(!latestFace || !latestPalm) && (
        <div className="bg-purple-900/20 border border-purple-700/20 rounded-2xl p-5 text-center">
          <p className="text-slate-300 text-sm mb-3">
            Complete your face and palm readings for a fuller comparison
          </p>
          <div className="flex gap-2">
            {!latestFace && (
              <button
                onClick={() => navigate('/face')}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium"
              >
                Face Reading
              </button>
            )}
            {!latestPalm && (
              <button
                onClick={() => navigate('/palm')}
                className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium"
              >
                Palm Reading
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions to extract traits from readings
function extractChartTraits(chart: any) {
  const sunSign = chart.planets.find((p: any) => p.planet === 'Sun')?.sign || 'Unknown';
  const moonSign = chart.planets.find((p: any) => p.planet === 'Moon')?.sign || 'Unknown';
  const lagna = chart.lagna.sign;

  const natureMap: Record<string, string> = {
    'Aries': 'Dynamic and pioneering',
    'Taurus': 'Stable and determined',
    'Gemini': 'Curious and adaptable',
    'Cancer': 'Nurturing and intuitive',
    'Leo': 'Confident and creative',
    'Virgo': 'Analytical and service-oriented',
    'Libra': 'Harmonious and diplomatic',
    'Scorpio': 'Intense and transformative',
    'Sagittarius': 'Adventurous and philosophical',
    'Capricorn': 'Ambitious and disciplined',
    'Aquarius': 'Innovative and humanitarian',
    'Pisces': 'Compassionate and imaginative',
  };

  return {
    coreNature: natureMap[sunSign] || 'Balanced',
    emotionalStyle: natureMap[moonSign] || 'Adaptive',
    lifePath: `Led by ${lagna} energy`,
  };
}

function extractFaceTraits(measurements: any) {
  const c = measurements.classifications;
  return {
    intellect: c.forehead === 'broad' ? 'Strong intellectual capacity' : c.forehead === 'narrow' ? 'Focused thinking' : 'Balanced intellect',
    empathy: c.eyes === 'wide-set' ? 'High empathy' : c.eyes === 'close-set' ? 'Focused intensity' : 'Balanced perspective',
    determination: c.chin === 'strong' ? 'Strong willpower' : c.chin === 'soft' ? 'Gentle adaptability' : 'Balanced resolve',
  };
}

function extractPalmTraits(measurements: any) {
  const c = measurements.classifications;
  return {
    vitality: c.lifeLine === 'long' ? 'Robust energy' : c.lifeLine === 'short' ? 'Intense living' : 'Steady vitality',
    emotionalDepth: c.heartLine === 'long' ? 'Deep emotional capacity' : c.heartLine === 'short' ? 'Practical love' : 'Balanced emotions',
    mentalClarity: c.headLine === 'long' ? 'Analytical depth' : c.headLine === 'short' ? 'Quick decisiveness' : 'Clear thinking',
  };
}

function findCommonThemes(
  chartTraits: ReturnType<typeof extractChartTraits> | null,
  faceTraits: ReturnType<typeof extractFaceTraits> | null,
  palmTraits: ReturnType<typeof extractPalmTraits> | null
) {
  const themes: Array<{ title: string; description: string; icon: React.ReactNode; sources: string[] }> = [];

  if (!chartTraits || !faceTraits || !palmTraits) return themes;

  // Check for intellectual alignment
  if (
    (chartTraits.coreNature.includes('Analytical') || chartTraits.coreNature.includes('Curious')) &&
    faceTraits.intellect.includes('intellectual') &&
    palmTraits.mentalClarity.includes('Analytical')
  ) {
    themes.push({
      title: 'Strong Intellectual Nature',
      description: 'All three readings point to a sharp, analytical mind with deep thinking abilities.',
      icon: <Brain size={16} className="text-blue-400" />,
      sources: ['Chart', 'Face', 'Palm'],
    });
  }

  // Check for emotional depth
  if (
    (chartTraits.emotionalStyle.includes('Nurturing') || chartTraits.emotionalStyle.includes('Compassionate')) &&
    faceTraits.empathy.includes('empathy') &&
    palmTraits.emotionalDepth.includes('Deep')
  ) {
    themes.push({
      title: 'Deep Emotional Intelligence',
      description: 'Your readings consistently show strong emotional awareness and empathy for others.',
      icon: <Heart size={16} className="text-pink-400" />,
      sources: ['Chart', 'Face', 'Palm'],
    });
  }

  // Check for determination
  if (
    (chartTraits.coreNature.includes('determined') || chartTraits.coreNature.includes('Ambitious')) &&
    faceTraits.determination.includes('willpower') &&
    palmTraits.vitality.includes('Robust')
  ) {
    themes.push({
      title: 'Strong Drive & Vitality',
      description: 'Multiple readings indicate powerful determination and life force energy.',
      icon: <Zap size={16} className="text-amber-400" />,
      sources: ['Chart', 'Face', 'Palm'],
    });
  }

  // Add partial matches (2 out of 3)
  if (chartTraits && faceTraits) {
    if (chartTraits.coreNature.includes('creative') && faceTraits.intellect.includes('intellectual')) {
      themes.push({
        title: 'Creative Intellect',
        description: 'Your chart and face both suggest a creative, innovative mind.',
        icon: <Sparkles size={16} className="text-purple-400" />,
        sources: ['Chart', 'Face'],
      });
    }
  }

  return themes;
}

function generateSynthesis(
  chartTraits: ReturnType<typeof extractChartTraits>,
  faceTraits: ReturnType<typeof extractFaceTraits>,
  palmTraits: ReturnType<typeof extractPalmTraits>
): string {
  const parts: string[] = [];

  if (chartTraits.coreNature.includes('Dynamic') || chartTraits.coreNature.includes('Ambitious')) {
    parts.push('have natural leadership qualities');
  } else if (chartTraits.coreNature.includes('Nurturing') || chartTraits.coreNature.includes('Compassionate')) {
    parts.push('are deeply caring and supportive');
  } else {
    parts.push('bring balance and wisdom to situations');
  }

  if (faceTraits.empathy.includes('empathy')) {
    parts.push('connect easily with others');
  }

  if (palmTraits.vitality.includes('Robust')) {
    parts.push('possess the energy to pursue your goals');
  }

  return parts.join(', ') || 'have a unique combination of strengths';
}
