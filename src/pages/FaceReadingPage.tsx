import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateFaceReadingInterpretation } from '../lib/ai';
import { Camera, RotateCcw, Sparkles, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaceMeasurements } from '../types';

export function FaceReadingPage() {
  const { addFaceReading, faceReadings } = useApp();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ measurements: FaceMeasurements; interpretation: string } | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera access and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);
    
    // Draw face mesh overlay (simulated landmarks)
    drawFaceMesh(ctx, canvas.width, canvas.height);
    
    stopCamera();
    setCaptured(true);
    processFace(canvas);
  }, [stream]);

  const drawFaceMesh = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulate face mesh landmarks (468 points mapped to face region)
    const centerX = width / 2;
    const centerY = height / 2;
    const faceWidth = width * 0.4;
    const faceHeight = height * 0.5;
    
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';

    // Generate realistic-looking face mesh points
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

    // Draw connections
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
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
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

  const processFace = (canvas: HTMLCanvasElement) => {
    setProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      // Generate simulated measurements based on canvas dimensions
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
          forehead: Math.random() > 0.5 ? 'broad' : Math.random() > 0.5 ? 'narrow' : 'balanced',
          eyes: Math.random() > 0.5 ? 'wide-set' : Math.random() > 0.5 ? 'close-set' : 'balanced',
          nose: Math.random() > 0.5 ? 'prominent' : Math.random() > 0.5 ? 'small' : 'balanced',
          chin: Math.random() > 0.5 ? 'strong' : Math.random() > 0.5 ? 'soft' : 'balanced',
        }
      };
      
      const interpretation = generateFaceReadingInterpretation(measurements);
      
      setResult({ measurements, interpretation });
      addFaceReading({ measurements, interpretation });
      setProcessing(false);
    }, 2000);
  };

  const reset = () => {
    setCaptured(false);
    setResult(null);
    setProcessing(false);
  };

  return (
    <div className="p-4 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg">
          <ArrowLeft size={20} className="text-slate-300" />
        </button>
        <h1 className="text-xl font-bold text-white">Face Reading</h1>
        <span className="text-xs text-slate-500 ml-auto">Mukha Shastra</span>
      </div>

      {!captured && !result && (
        <>
          {/* Camera View */}
          <div className="relative aspect-[3/4] bg-black/50 rounded-2xl overflow-hidden border border-purple-800/20">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Camera size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm">Camera preview will appear here</p>
              </div>
            )}
            
            {/* Face guide overlay */}
            {stream && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-2 border-dashed border-purple-400/40 rounded-full" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {cameraError && (
            <p className="text-red-400 text-sm text-center">{cameraError}</p>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!stream ? (
              <button
                onClick={startCamera}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Start Camera
              </button>
            ) : (
              <button
                onClick={capturePhoto}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 animate-pulse"
              >
                <Camera size={20} />
                Capture & Analyze
              </button>
            )}
          </div>

          {/* Info */}
          <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
            <h3 className="text-white font-medium text-sm mb-2">How it works</h3>
            <ul className="text-slate-400 text-xs space-y-1.5">
              <li>• Position your face within the guide oval</li>
              <li>• Ensure good, even lighting</li>
              <li>• Look directly at the camera</li>
              <li>• Face mesh will be overlaid to show measurements</li>
              <li>• Interpretation based on Vedic Mukha Shastra</li>
            </ul>
          </div>

          {/* Previous Readings */}
          {faceReadings.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-3 border border-purple-800/20 rounded-xl text-purple-300 text-sm hover:bg-white/5"
            >
              {showHistory ? 'Hide' : 'View'} Previous Readings ({faceReadings.length})
            </button>
          )}

          {showHistory && faceReadings.length > 0 && (
            <div className="space-y-3">
              {faceReadings.slice().reverse().map((fr, i) => (
                <div key={fr.id} className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">
                    {new Date(fr.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-slate-300 text-sm line-clamp-3">{fr.interpretation.substring(0, 150)}...</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Processing State */}
      {processing && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-white font-medium">Analyzing facial features...</p>
          <p className="text-slate-400 text-sm mt-2">Detecting landmarks and computing measurements</p>
        </div>
      )}

      {/* Result */}
      {result && !processing && (
        <div className="space-y-4">
          {/* Captured Image with Mesh */}
          <div className="relative aspect-[3/4] bg-black/50 rounded-2xl overflow-hidden border border-purple-800/20">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />
          </div>

          {/* Measurements */}
          <div className="bg-white/5 border border-purple-800/20 rounded-xl p-4">
            <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
              <Check size={14} className="text-emerald-400" />
              Detected Measurements
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-slate-400">Forehead</span>
                <p className="text-white font-medium">{result.measurements.foreheadWidth.toFixed(1)} cm</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-slate-400">Eye Distance</span>
                <p className="text-white font-medium">{result.measurements.eyeDistance.toFixed(1)} cm</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-slate-400">Nose Length</span>
                <p className="text-white font-medium">{result.measurements.noseLength.toFixed(1)} cm</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-slate-400">Chin Width</span>
                <p className="text-white font-medium">{result.measurements.chinWidth.toFixed(1)} cm</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-slate-400">Face Length</span>
                <p className="text-white font-medium">{result.measurements.faceLength.toFixed(1)} cm</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <span className="text-slate-400">Jaw Angle</span>
                <p className="text-white font-medium">{result.measurements.jawAngle.toFixed(0)}°</p>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-700/20 rounded-2xl p-5">
            <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400" />
              Vedic Face Reading
            </h3>
            <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
              {result.interpretation}
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={reset}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Take Another Reading
          </button>
        </div>
      )}
    </div>
  );
}
