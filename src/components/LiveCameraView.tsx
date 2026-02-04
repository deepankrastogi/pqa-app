import React, { useEffect, useRef, useCallback } from 'react';
import { useVideoCamera } from '@/hooks/useVideoCamera';
import { useDetectionOverlay, Detection } from '@/hooks/useDetectionOverlay';
import { Loader2 } from 'lucide-react';

interface LiveCameraViewProps {
  onCapture: (photoDataUrl: string) => void;
  isCapturing: boolean;
  /** Detection results from your backend API */
  detections?: Detection[];
}

const LiveCameraView: React.FC<LiveCameraViewProps> = ({ 
  onCapture, 
  isCapturing,
  detections = [] 
}) => {
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    videoRef,
    canvasRef,
    isStreaming,
    error,
    startCamera,
    capturePhoto,
  } = useVideoCamera();

  const { drawDetections } = useDetectionOverlay();

  // Start camera on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startCamera();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [startCamera]);

  // Draw detections on overlay canvas when detections change
  useEffect(() => {
    if (!overlayCanvasRef.current || !videoRef.current || !isStreaming) return;
    
    const overlay = overlayCanvasRef.current;
    const video = videoRef.current;
    const ctx = overlay.getContext('2d');
    
    if (!ctx) return;
    
    // Calculate scale factors
    const scaleX = overlay.width / (video.videoWidth || 1);
    const scaleY = overlay.height / (video.videoHeight || 1);
    
    drawDetections(ctx, detections, scaleX, scaleY);
  }, [detections, drawDetections, videoRef, isStreaming]);

  // Resize overlay canvas to match container
  useEffect(() => {
    const handleResize = () => {
      if (!overlayCanvasRef.current || !containerRef.current) return;
      
      const container = containerRef.current;
      overlayCanvasRef.current.width = container.clientWidth;
      overlayCanvasRef.current.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isStreaming]);

  const handleCapture = useCallback(() => {
    const photo = capturePhoto();
    if (photo) {
      onCapture(photo);
    }
  }, [capturePhoto, onCapture]);

  // Trigger capture when isCapturing changes
  useEffect(() => {
    if (isCapturing) {
      handleCapture();
    }
  }, [isCapturing, handleCapture]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/50 p-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">{error}</p>
          <button 
            onClick={startCamera}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 relative bg-black overflow-hidden">
      {/* Video stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Detection overlay canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* Loading state */}
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-3">
            <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
            <p className="text-white text-sm">Starting camera...</p>
          </div>
        </div>
      )}
      
      {/* Detection status indicator */}
      {isStreaming && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Camera Ready
          {detections.length > 0 && (
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {detections.length} detected
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveCameraView;
