import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePhotoQueue } from '@/hooks/usePhotoQueue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LiveCameraView from '@/components/LiveCameraView';
import { 
  Camera as CameraIcon, 
  Check, 
  RefreshCw, 
  LogOut,
  Wifi,
  WifiOff,
  Upload,
  Loader2
} from 'lucide-react';

const CameraPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pendingCount, isOnline, isSyncing, addToQueue } = usePhotoQueue();
  
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handlePhotoCapture = useCallback((photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
    setIsCapturing(false);
  }, []);

  const handleCaptureClick = () => {
    setIsCapturing(true);
  };

  const handleSubmit = () => {
    if (capturedPhoto && user) {
      addToQueue({
        dataUrl: capturedPhoto,
        storeId: user.storeId,
        userId: user.id,
      });
      
      // Clear and return to live camera
      setCapturedPhoto(null);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  // Preview mode - show captured photo
  if (capturedPhoto) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
        {/* Preview Image */}
        <div className="flex-1 relative">
          <img
            src={capturedPhoto}
            alt="Captured food"
            className="w-full h-full object-contain bg-black"
          />
        </div>

        {/* Action Buttons */}
        <div className="safe-area-bottom bg-card border-t border-border p-4">
          <div className="flex gap-3 max-w-md mx-auto">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 h-14 text-lg gap-2"
              onClick={handleRetake}
            >
              <RefreshCw className="h-5 w-5" />
              Retake
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 text-lg gap-2"
              onClick={handleSubmit}
            >
              <Check className="h-5 w-5" />
              Submit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Camera mode - live view with detection
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top Bar */}
      <div className="safe-area-top bg-card/80 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center justify-between p-3">
          {/* Store Badge */}
          <Badge variant="secondary" className="text-sm font-mono">
            {user?.storeId || 'STORE-???'}
          </Badge>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {/* Pending uploads indicator */}
            {pendingCount > 0 && (
              <Badge 
                variant="outline" 
                className="gap-1 text-warning border-warning/50"
              >
                {isSyncing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                {pendingCount}
              </Badge>
            )}

            {/* Online/Offline indicator */}
            <Badge 
              variant={isOnline ? "secondary" : "destructive"}
              className="gap-1"
            >
              {isOnline ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
            </Badge>

            {/* Logout button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live Camera View with Detection */}
      <LiveCameraView 
        onCapture={handlePhotoCapture}
        isCapturing={isCapturing}
      />

      {/* Capture Button */}
      <div className="safe-area-bottom bg-card/80 backdrop-blur-sm border-t border-border p-6 z-10">
        <div className="flex justify-center">
          <button
            onClick={handleCaptureClick}
            disabled={isCapturing}
            className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center
                       transition-all duration-200 active:scale-95 disabled:opacity-50
                       focus:outline-none focus:ring-4 focus:ring-primary/30"
            aria-label="Take photo"
          >
            {/* Pulse animation ring */}
            {!isCapturing && (
              <span className="absolute inset-0 rounded-full bg-primary/50 animate-pulse-ring" />
            )}
            
            {/* Inner circle */}
            <span className="absolute inset-2 rounded-full bg-primary-foreground/20" />
            
            {isCapturing ? (
              <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
            ) : (
              <CameraIcon className="h-8 w-8 text-primary-foreground" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraPage;
