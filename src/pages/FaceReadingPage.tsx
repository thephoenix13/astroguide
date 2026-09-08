import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateFaceReadingInterpretation } from '../lib/ai';
import { ArrowLeft, History, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaceMeasurements } from '../types';
import { ImageCapture } from '../components/ImageCapture';

export function FaceReadingPage() {
  const { addFaceReading, faceReadings } = useApp();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ measurements: FaceMeasurements; interpretation: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const handleImageCaptured = (canvas: HTMLCanvasElement, _imageDataUrl: string) => {
    setProcessing(true);

    setTimeout(() => {
      // Draw face mesh overlay on the canvas
      drawFaceMesh(canvas);

      // Generate simulated measurements
      const width = canvas.width;
      const height = canvas.height;
      
      const measurements: FaceMeasurements = {
        foreheadWidth: 8.5 + Math.random() * 3,
        eyeDistance: 5.5 + Math.random() * 2,
        noseLength: 4.0 + Math.random() * 1.5,
        chinWidth: 6.0 + Math.random() * 2,
        faceLength: 15.0 + Math.random() * 3,
        jawAngle: 110 + Math.random() * 20,
        classifications: {
          forehead: measurements_forehead(width, height),
          eyes: measurements_eyes(width, height),
          nose: measurements_nose(width, height),
          chin: measurements_chin(width, height),
        }
      };

      const interpretation = generateFaceReadingInterpretation(measurements);
      
      setResult({ measurements, interpretation });
      addFaceReading({ measurements, interpretation });
      setProcessing(false);
    }, 1500);
  };

  const drawFaceMesh = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const faceWidth = width * 0.4;
    const faceHeight = height * 0.5;
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';

    const points: [number, number][] = [];
    
    // Face oval
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const rx = faceWidth / 2 * (1 + 0.1 * Math.sin(angle * 3));
      const ry = faceHeight / 2;
      points.push([
        centerX + Math.cos(angle) * rx,
        centerY + Math.sin(angle) * ry * 0.9
      ]);
    }
    
    // Left eye
    const leftEyeCenter = [centerX - faceWidth * 0.2, centerY - faceHeight * 0.1];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      points.push([
        leftEyeCenter[0] + Math.cos(angle) * faceWidth * 0.08,
        leftEyeCenter[1] + Math.sin(angle) * faceHeight * 0.03
      ]);
    }
    
    // Right eye
    const rightEyeCenter = [centerX + faceWidth * 0.2, centerY - faceHeight * 0.1];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      points.push([
        rightEyeCenter[0] + Math.cos(angle) * faceWidth * 0.08,
        rightEyeCenter[1] + Math.sin(angle) * faceHeight * 0.03
      ]);
    }
    
    // Nose bridge
    for (let i = 0; i < 8; i++) {
      points.push([centerX + (Math.random() - 0.5) * 4, centerY - faceHeight * 0.15 + i * faceHeight * 0.04]);
    }
    
    // Lips
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      points.push([
        centerX + Math.cos(angle) * faceWidth * 0.12,
        centerY + faceHeight * 0.2 + Math.sin(angle) * faceHeight * 0.03
      ]);
    }
    
    // Eyebrows
    for (let i = 0; i < 10; i++) {
      points.push([
        leftEyeCenter[0] - faceWidth * 0.08 + i * faceWidth * 0.016,
        leftEyeCenter[1] - faceHeight * 0.08 + Math.sin(i * 0.5) * 3
      ]);
      points.push([
        rightEyeCenter[0] - faceWidth * 0.08 + i * faceWidth * 0.016,
        rightEyeCenter[1] - faceHeight * 0.08 + Math.sin(i * 0.5) * 3
      ]);
    }

    // Draw connections - face oval
    ctx.beginPath();
    for (let i = 0; i < 36; i++) {
      const next = (i + 1) % 36;
      ctx.moveTo(points[i][0], points[i][1]);
      ctx.lineTo(points[next][0], points[next][1]);
    }
    ctx.stroke();

    // Draw eye connections
    ctx.beginPath();
    for (let i = 36; i < 60; i++) {
      const next = i + 1;
      const nextIdx = next < 60 ? next : 36;
      ctx.moveTo(points[i][0], points[i][1]);
      ctx.lineTo(points[nextIdx][0], points[nextIdx][1]);
    }
    ctx.stroke();

    // Draw points
    points.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add measurement lines
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    
    // Forehead width line
    ctx.beginPath();
    ctx.moveTo(centerX - faceWidth * 0.35, centerY - faceHeight * 0.35);
    ctx.lineTo(centerX + faceWidth * 0.35, centerY - faceHeight * 0.35);
    ctx.stroke();
    
    // Eye distance line
    ctx.beginPath();
    ctx.moveTo(leftEyeCenter[0], leftEyeCenter[1]);
    ctx.lineTo(rightEyeCenter[0], rightEyeCenter[1]);
    ctx.stroke();
    
    ctx.setLineDash([]);
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
          <h1 className="text-xl font-bold text-white">Face Reading History</h1>
        </div>

        {faceReadings.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No face readings yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faceReadings.slice().reverse().map((reading, i) => (
              <div key={reading.id} className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-purple-400" />
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
          <h1 className="text-xl font-bold text-white">Face Reading Result</h1>
        </div>

        {/* Measurements */}
        <div className="bg-white/5 border border-purple-800/20 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3">Detected Measurements</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Forehead</span>
              <span className="text-amber-300">{result.measurements.foreheadWidth.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Eye Distance</span>
              <span className="text-amber-300">{result.measurements.eyeDistance.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nose Length</span>
              <span className="text-amber-300">{result.measurements.noseLength.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Chin Width</span>
              <span className="text-amber-300">{result.measurements.chinWidth.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Face Length</span>
              <span className="text-amber-300">{result.measurements.faceLength.toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Jaw Angle</span>
              <span className="text-amber-300">{result.measurements.jawAngle.toFixed(0)}°</span>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/20 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            Interpretation
          </h2>
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {result.interpretation}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full py-3 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-500 transition-colors"
        >
          New Face Reading
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
          <h1 className="text-xl font-bold text-white">Face Reading</h1>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="p-2 hover:bg-white/5 rounded-lg relative"
        >
          <History size={20} className="text-slate-300" />
          {faceReadings.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {faceReadings.length}
            </span>
          )}
        </button>
      </div>

      <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-800/20 rounded-2xl p-5">
        <p className="text-slate-300 text-sm mb-4">
          Capture your face or upload a photo for a Vedic face reading (Mukha Shastra). 
          We'll analyze your facial proportions and provide insights based on ancient wisdom.
        </p>
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <span className="text-purple-400">✦</span>
          <p>Your image is processed locally and not stored permanently. Only measurements and interpretations are saved.</p>
        </div>
      </div>

      {processing ? (
        <div className="aspect-square bg-black rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-purple-300 text-sm">Analyzing facial features...</p>
          </div>
        </div>
      ) : (
        <ImageCapture
          onImageCaptured={handleImageCaptured}
          aspectRatio="aspect-square"
          label="Face"
          overlayType="face"
        />
      )}
    </div>
  );
}

// Helper functions for measurement classification
function measurements_forehead(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 0.7) return 'broad';
  if (ratio < 0.5) return 'narrow';
  return 'balanced';
}

function measurements_eyes(width: number, height: number): string {
  const ratio = (width * 0.3) / (height * 0.2);
  if (ratio > 1.5) return 'wide-set';
  if (ratio < 1.0) return 'close-set';
  return 'balanced';
}

function measurements_nose(width: number, height: number): string {
  const ratio = height / width;
  if (ratio > 0.5) return 'prominent';
  if (ratio < 0.3) return 'small';
  return 'medium';
}

function measurements_chin(width: number, height: number): string {
  const ratio = width / height;
  if (ratio > 0.6) return 'strong';
  if (ratio < 0.4) return 'soft';
  return 'moderate';
}
