import { useApp } from '../context/AppContext';
import { getChartInterpretation } from '../lib/astrology';
import { ArrowLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ChartPage() {
  const { user } = useApp();
  const navigate = useNavigate();
  
  if (!user?.chartData) {
    return (
      <div className="p-4 text-center text-slate-400">
        <p>No chart data available. Please complete onboarding.</p>
      </div>
    );
  }

  const chart = user.chartData;
  const interpretations = getChartInterpretation(chart);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft size={20} className="text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-white">Birth Chart (Kundli)</h1>
      </div>

      {/* Lagna */}
      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-2xl p-5">
        <h2 className="text-amber-300 font-semibold text-sm uppercase tracking-wide mb-2">Ascendant (Lagna)</h2>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-white">{chart.lagna.sign}</span>
          <span className="text-slate-400 text-sm">{chart.lagna.degree.toFixed(1)}° • Lord: {chart.lagna.lord}</span>
        </div>
      </div>

      {/* Planet Positions Table */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl overflow-hidden">
        <h2 className="text-white font-semibold p-4 pb-2">Planetary Positions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs border-b border-purple-800/20">
                <th className="text-left p-3">Planet</th>
                <th className="text-left p-3">Sign</th>
                <th className="text-center p-3">House</th>
                <th className="text-right p-3">Degree</th>
                <th className="text-center p-3">R</th>
              </tr>
            </thead>
            <tbody>
              {chart.planets.map((planet, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0">
                  <td className="p-3 text-white font-medium">
                    <span className="flex items-center gap-2">
                      {planet.planet === 'Sun' ? '☉' : planet.planet === 'Moon' ? '☽' : planet.planet === 'Mars' ? '♂' : planet.planet === 'Mercury' ? '☿' : planet.planet === 'Jupiter' ? '♃' : planet.planet === 'Venus' ? '♀' : planet.planet === 'Saturn' ? '♄' : planet.planet === 'Rahu' ? '☊' : '☋'}
                      {planet.planet}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{planet.sign}</td>
                  <td className="p-3 text-center text-amber-300">{planet.house}</td>
                  <td className="p-3 text-right text-slate-400">{planet.degree.toFixed(2)}°</td>
                  <td className="p-3 text-center">
                    {planet.retrograde && <span className="text-red-400 text-xs">R</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nakshatra */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-2">Moon's Nakshatra</h2>
        <p className="text-2xl text-amber-300 font-bold">{chart.moonNakshatra}</p>
        <p className="text-slate-400 text-sm mt-1">Your emotional nature is shaped by this star constellation</p>
      </div>

      {/* Dasha */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-3">Current Dasha Period</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Mahadasha</p>
            <p className="text-xl text-white font-bold">{chart.mahadasha.planet}</p>
            <p className="text-slate-500 text-xs">{chart.mahadasha.start} – {chart.mahadasha.end}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Antardasha</p>
            <p className="text-xl text-white font-bold">{chart.antardasha.planet}</p>
            <p className="text-slate-500 text-xs">{chart.antardasha.start} – {chart.antardasha.end}</p>
          </div>
        </div>
      </div>

      {/* Sade Sati */}
      <div className={`border rounded-2xl p-5 ${chart.sadeSati.active ? 'bg-orange-900/20 border-orange-700/30' : 'bg-emerald-900/20 border-emerald-700/30'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Info size={16} className={chart.sadeSati.active ? 'text-orange-400' : 'text-emerald-400'} />
          <h2 className="text-white font-semibold">Sade Sati Status</h2>
        </div>
        <p className={`text-lg font-bold ${chart.sadeSati.active ? 'text-orange-300' : 'text-emerald-300'}`}>
          {chart.sadeSati.phase}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          {chart.sadeSati.active
            ? 'Saturn is transiting near your Moon sign. This is a time of growth through discipline.'
            : 'Saturn is not currently influencing your Moon sign. A relatively comfortable period.'}
        </p>
      </div>

      {/* Interpretations */}
      <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Key Interpretations</h2>
        <div className="space-y-4">
          {interpretations.map((text, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-purple-300">{i + 1}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
