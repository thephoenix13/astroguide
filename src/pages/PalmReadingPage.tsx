import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generatePalmReadingInterpretation } from '../lib/ai';
import { ArrowLeft, History, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PalmMeasurements } from '../types';
import { ImageCapture } from '../components/ImageCapture';

export function PalmReadingPage() {
  const { addPalmReading, palmReadings } = useApp();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ measurements: PalmMeasurements; interpretation: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleImageCaptured = (canvas: HTMLCanvasElement, _imageDataUrl: string) => {
    setProcessing(true);

    setTimeout(() => {
      // Draw palm lines overlay
      drawPalmLines(canvas);

      // Generate simulated measurements based on image dimensions
      const width = canvas.width;
      const height = canvas.height;
      const aspect = width / height;
      
      const measurements: PalmMeasurements = {
        lifeLineLength: 6 + Math.random() * 6,
        heartLineLength: 5 + Math.random() * 5,
        headLineLength: 5 + Math.random() * 5,
        fateLinePresent: Math.random() > 0.3,
        sunLinePresent: Math.random() > 0.5,
        palmWidth: 7 + Math.random() * 3,
        fingerLength: 6 + Math.random() * 4,
        fingerSpacing: 0.5 + Math.random() * 1.5,
        lineClarity: 0.4 + Math.random() * 0.6,
        classifications: {
          lifeLine: aspect > 0.8 ? 'long' : aspect > 0.6 ? 'moderate' : 'short',
          heartLine: Math.random() > 0.5 ? 'long' : Math.random() > 0.5 ? 'short' : 'moderate',
          headLine: Math.random() > 0.5 ? 'long' : Math.random() > 0.5 ? 'short' : 'moderate',
          fateLine: Math.random() > 0.5 ? 'clear' : 'faint',
          sunLine: Math.random() > 0.5 ? 'visible' : 'faint',
          palmShape: aspect > 0.9 ? 'rectangular' : aspect > 0.7 ? 'balanced' : 'square',
          fingers: Math.random() > 0.5 ? 'long' : Math.random() > 0.5 ? 'short' : 'medium',
          clarity: Math.random() > 0.6 ? 'clear' : Math.random() > 0.5 ? 'faint' : 'moderate',
        }
      };

      const interpretation = generatePalmReadingInterpretation(measurements);
      
      setResult({ measurements, interpretation });
      addPalmReading({ measurements, interpretation });
      setProcessing(false);
    }, 1500);
  };

  const drawPalmLines = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw palm outline
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, width * 0.35, height * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Life Line (curves around thumb)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.15, centerY - height * 0.25);
    ctx.quadraticCurveTo(
      centerX - width * 0.25, centerY,
      centerX - width * 0.1, centerY + height * 0.3
    );
    ctx.stroke();

    // Heart Line (top horizontal)
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.2, centerY - height * 0.15);
    ctx.quadraticCurveTo(
      centerX, centerY - height * 0.12,
      centerX + width * 0.2, centerY - height * 0.18
    );
    ctx.stroke();

    // Head Line (middle horizontal)
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.18, centerY - height * 0.02);
    ctx.quadraticCurveTo(
      centerX, centerY + height * 0.02,
      centerX + width * 0.22, centerY - height * 0.05
    );
    ctx.stroke();

    // Fate Line (vertical from bottom)
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + height * 0.35);
    ctx.lineTo(centerX + (Math.random() - 0.5) * 10, centerY - height * 0.2);
    ctx.stroke();

    // Sun Line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX + width * 0.1, centerY + height * 0.2);
    ctx.lineTo(centerX + width * 0.12, centerY - height * 0.15);
    ctx.stroke();

    // Draw measurement points
    ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
    const keyPoints = [
      [centerX - width * 0.15, centerY - height * 0.25], // Life line start
      [centerX - width * 0.1, centerY + height * 0.3],   // Life line end
      [centerX - width * 0.2, centerY - height * 0.15],  // Heart line start
      [centerX + width * 0.2, centerY - height * 0.18],  // Heart line end
      [centerX - width * 0.18, centerY - height * 0.02], // Head line start
      [centerX + width * 0.22, centerY - height * 0.05], // Head line end
      [centerX, centerY + height * 0.35],                 // Fate line start
    ];

    keyPoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Life', centerX - width * 0.3, centerY);
    ctx.fillText('Heart', centerX - width * 0.05, centerY - height * 0.2);
    ctx.fillText('Head', centerX + width * 0.05, centerY + height * 0.05);
    ctx.fillText('Fate', centerX + width * 0.03, centerY + height * 0.15);
  };

  const reset = () => {
    setResult(null);
    setProcessing(false);
  };

  // History view
  if (showHistory) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-lg">
            <ArrowLeft size={20} className="text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-white">Palm Reading History</h1>
        </div>

        {palmReadings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No palm readings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {palmReadings.slice().reverse().map((reading) => (
              <div key={reading.id} className="bg-white/5 border border-amber-800/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-xs text-slate-500">
                    {new Date(reading.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-300 text-sm line-clamp-3">
                  {reading.interpretation.substring(0, 150)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Result view
  if (result) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
            <ArrowLeft size={20} className="text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-white">Palm Reading Result</h1>
        </div>

        {/* Measurements */}
        <div className="bg-white/5 border border-amber-800/20 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3">Detected Features</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Life Line</span>
              <span className="text-amber-300">{result.measurements.lifeLineLength.toFixed(1)} cm ({result.measurements.classifications.lifeLine})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heart Line</span>
              <span className="text-amber-300">{result.measurements.heartLineLength.toFixed(1)} cm ({result.measurements.classifications.heartLine})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Head Line</span>
              <span className="text-amber-300">{result.measurements.headLineLength.toFixed(1)} cm ({result.measurements.classifications.headLine})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fate Line</span>
              <span className="text-amber-300">{result.measurements.fateLinePresent ? 'Present' : 'Absent'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sun Line</span>
              <span className="text-amber-300">{result.measurements.sunLinePresent ? 'Present' : 'Absent'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Palm Shape</span>
              <span className="text-amber-300">{result.measurements.classifications.palmShape}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fingers</span>
              <span className="text-amber-300">{result.measurements.classifications.fingers} ({result.measurements.fingerLength.toFixed(1)} cm)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Line Clarity</span>
              <span className="text-amber-300">{result.measurements.classifications.clarity} ({(result.measurements.lineClarity * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/20 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            Interpretation
          </h2>
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {result.interpretation}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full py-3 bg-amber-600 rounded-xl text-white font-medium hover:bg-amber-500 transition-colors"
        >
          New Palm Reading
        </button>
      </div>
    );
  }

  // Main capture view
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
            <ArrowLeft size={20} className="text-slate-300" />
          </button>
          <h1 className="text-xl font-bold text-white">Palm Reading</h1>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="p-2 hover:bg-white/5 rounded-lg relative"
        >
          <History size={20} className="text-slate-300" />
          {palmReadings.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {palmReadings.length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-800/20 rounded-2xl p-5">
        <p className="text-slate-300 text-sm mb-4">
          Capture your palm or upload a photo for a Vedic palm reading (Hasta Samudrika Shastra). 
          We'll analyze your palm lines and provide insights about your life path, heart, and mind.
        </p>
        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <span className="text-amber-400">✦</span>
            <p>Hold your dominant hand flat, palm facing the camera</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">✦</span>
            <p>Ensure good lighting so all lines are clearly visible</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400">✦</span>
            <p>Image is processed locally and not stored permanently</p>
          </div>
        </div>
      </div>

      {processing ? (
        <div className="aspect-[3/4] bg-black rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-amber-300 text-sm">Reading your palm...</p>
          </div>
        </div>
      ) : (
        <ImageCapture
          onImageCaptured={handleImageCaptured}
          aspectRatio="aspect-[3/4]"
          label="Palm"
          overlayType="palm"
          cameraFacing="environment"
        />
      )}
    </div>
  );
}
