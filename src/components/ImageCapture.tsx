import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, RefreshCw, X, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageCaptureProps {
  onImageCaptured: (canvas: HTMLCanvasElement, imageDataUrl: string) => void;
  aspectRatio?: string;
  label?: string;
  overlayType?: 'face' | 'palm' | 'none';
  cameraFacing?: 'user' | 'environment';
}

export function ImageCapture({ onImageCaptured, aspectRatio = 'aspect-square', label = 'Capture', overlayType = 'none', cameraFacing = 'user' }: ImageCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraReady(false);
  }, [stream]);

  const startCamera = async () => {
    setMode('camera');
    setCameraError('');
    setCameraReady(false);

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not available in this browser. Please use the upload option instead.');
        return;
      }

      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setCameraError('Camera requires HTTPS. Please use the upload option or access via HTTPS.');
        return;
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraFacing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().then(() => {
            setCameraReady(true);
          }).catch(() => {
            // Try without playsinline for some browsers
            if (videoRef.current) {
              videoRef.current.setAttribute('playsinline', 'false');
              videoRef.current.play().then(() => {
                setCameraReady(true);
              }).catch(() => {
                setCameraError('Could not start video playback. Try the upload option.');
              });
            }
          });
        };
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings, or use the upload option.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please use the upload option.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is being used by another app. Close other apps and try again, or use upload.');
      } else if (err.name === 'OverconstrainedError') {
        // Retry with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(simpleStream);
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().then(() => setCameraReady(true));
            };
          }
        } catch {
          setCameraError('Could not access camera with any configuration. Please use upload.');
        }
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown error'}. Please try the upload option.`);
      }
    }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const captureFromCamera = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stopCamera();
    setProcessing(true);

    // Small delay to show processing state
    setTimeout(() => {
      onImageCaptured(canvas, dataUrl);
      setProcessing(false);
    }, 800);
  }, [cameraReady, stream, onImageCaptured]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setCameraError('Image too large. Please select an image under 10MB.');
      return;
    }

    setMode('upload');
    setCameraError('');
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);

      // Draw to canvas
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        
        setTimeout(() => {
          onImageCaptured(canvas, dataUrl);
          setProcessing(false);
        }, 800);
      };
      img.onerror = () => {
        setCameraError('Could not load image. Please try another file.');
        setProcessing(false);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setCameraError('Could not read file. Please try again.');
      setProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    stopCamera();
    setMode('select');
    setCapturedImage(null);
    setCameraError('');
    setCameraReady(false);
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Selection screen
  if (mode === 'select') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={startCamera}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-700/30 rounded-2xl hover:border-purple-500/50 transition-all active:scale-95"
          >
            <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Camera size={24} className="text-purple-300" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">Take Photo</p>
              <p className="text-slate-500 text-xs mt-0.5">Use camera</p>
            </div>
          </button>

          <button
            onClick={() => { setMode('upload'); fileInputRef.current?.click(); }}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-700/30 rounded-2xl hover:border-amber-500/50 transition-all active:scale-95"
          >
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Upload size={24} className="text-amber-300" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-sm">Upload Image</p>
              <p className="text-slate-500 text-xs mt-0.5">From gallery</p>
            </div>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={cameraFacing}
          onChange={handleFileUpload}
          className="hidden"
        />

        {cameraError && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{cameraError}</p>
          </div>
        )}
      </div>
    );
  }

  // Camera mode
  if (mode === 'camera') {
    return (
      <div className="space-y-4">
        <div className={`relative ${aspectRatio} bg-black rounded-2xl overflow-hidden`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          
          {/* Camera overlay guide */}
          {cameraReady && overlayType !== 'none' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {overlayType === 'face' && (
                <div className="w-48 h-60 border-2 border-purple-400/50 rounded-[50%] animate-pulse">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-purple-300/50 text-xs">Position face here</span>
                  </div>
                </div>
              )}
              {overlayType === 'palm' && (
                <div className="w-52 h-64 border-2 border-amber-400/50 rounded-3xl animate-pulse">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-amber-300/50 text-xs">Place palm here</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 size={32} className="text-purple-400 animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Starting camera...</p>
            </div>
          )}

          {/* Error state */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6">
              <AlertCircle size={32} className="text-red-400 mb-3" />
              <p className="text-red-300 text-sm text-center mb-4">{cameraError}</p>
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white/10 rounded-lg text-white text-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={() => { setCameraError(''); startCamera(); }}
                  className="px-4 py-2 bg-purple-600 rounded-lg text-white text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Processing overlay */}
          {processing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 size={32} className="text-amber-400 animate-spin mb-3" />
              <p className="text-amber-300 text-sm">Analyzing...</p>
            </div>
          )}
        </div>

        {/* Camera controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={reset}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
          
          <button
            onClick={captureFromCamera}
            disabled={!cameraReady || processing}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-white/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white" />
          </button>

          <button
            onClick={() => { stopCamera(); setMode('upload'); fileInputRef.current?.click(); }}
            className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <ImageIcon size={20} className="text-white" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture={cameraFacing}
          onChange={handleFileUpload}
          className="hidden"
        />

        <p className="text-center text-slate-500 text-xs">
          {overlayType === 'face' ? 'Position your face within the oval guide' : 
           overlayType === 'palm' ? 'Hold your palm flat, facing the camera clearly' :
           `Position ${label.toLowerCase()} clearly in frame`}
        </p>
      </div>
    );
  }

  // Upload / Result mode
  if (mode === 'upload' && !capturedImage) {
    return (
      <div className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`${aspectRatio} border-2 border-dashed border-purple-700/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all`}
        >
          <Upload size={32} className="text-purple-400 mb-3" />
          <p className="text-white font-medium text-sm">Tap to upload image</p>
          <p className="text-slate-500 text-xs mt-1">JPG, PNG up to 10MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {processing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 size={20} className="text-amber-400 animate-spin" />
            <p className="text-amber-300 text-sm">Processing image...</p>
          </div>
        )}

        {cameraError && (
          <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded-xl">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{cameraError}</p>
          </div>
        )}

        <button
          onClick={reset}
          className="w-full py-2 text-slate-400 text-sm hover:text-white transition-colors"
        >
          ← Back to options
        </button>
      </div>
    );
  }

  // Result display
  return (
    <div className="space-y-4">
      <div className={`relative ${aspectRatio} bg-black rounded-2xl overflow-hidden`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
        {processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <Loader2 size={32} className="text-amber-400 animate-spin mb-3" />
            <p className="text-amber-300 text-sm">Analyzing...</p>
          </div>
        )}
      </div>

      <button
        onClick={reset}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-purple-800/20 rounded-xl text-slate-300 text-sm hover:bg-white/10 transition-colors"
      >
        <RefreshCw size={16} />
        Take Another Photo
      </button>
    </div>
  );
}
