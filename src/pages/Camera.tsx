import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCamera } from '@/hooks/useCamera';
import { usePhotoQueue } from '@/hooks/usePhotoQueue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera as CameraIcon, 
  X, 
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
  const { capturedPhoto, isCapturing, error, takePhoto, clearPhoto } = useCamera();
  const { pendingCount, isOnline, isSyncing, addToQueue } = usePhotoQueue();

  // Auto-launch camera on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      takePhoto();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleSubmit = () => {
    if (capturedPhoto && user) {
      addToQueue({
        dataUrl: capturedPhoto,
        storeId: user.storeId,
        userId: user.id,
      });
      
      // Immediately clear and retake - instant flow
      clearPhoto();
      takePhoto();
    }
  };

  const handleRetake = () => {
    clearPhoto();
    takePhoto();
  };

  // Preview mode - show captured photo
  if (capturedPhoto) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
        {/* Preview Image */}
        <div className="flex-1 relative">
          <img
            src={capturedPhoto}
            alt="Captured pizza"
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

  // Camera mode - ready to capture
  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Top Bar */}
      <div className="safe-area-top bg-card/80 backdrop-blur-sm border-b border-border">
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

      {/* Camera View Placeholder */}
      <div className="flex-1 flex items-center justify-center bg-muted/50">
        <div className="text-center p-6">
          {error ? (
            <div className="space-y-4">
              <X className="h-16 w-16 mx-auto text-destructive" />
              <p className="text-lg text-muted-foreground">{error}</p>
              <Button onClick={takePhoto} variant="secondary">
                Try Again
              </Button>
            </div>
          ) : isCapturing ? (
            <div className="space-y-4">
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
              <p className="text-lg text-muted-foreground">Opening camera...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <CameraIcon className="h-16 w-16 mx-auto text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Tap the button below to capture</p>
            </div>
          )}
        </div>
      </div>

      {/* Capture Button */}
      <div className="safe-area-bottom bg-card/80 backdrop-blur-sm border-t border-border p-6">
        <div className="flex justify-center">
          <button
            onClick={takePhoto}
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
