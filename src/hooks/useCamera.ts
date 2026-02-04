import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface UseCameraReturn {
  capturedPhoto: string | null;
  isCapturing: boolean;
  error: string | null;
  takePhoto: () => Promise<void>;
  clearPhoto: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = useCallback(async () => {
    setIsCapturing(true);
    setError(null);

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1920,
        height: 1080,
        correctOrientation: true,
      });

      if (image.dataUrl) {
        setCapturedPhoto(image.dataUrl);
      } else {
        throw new Error('No image data received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture photo';
      
      // Don't show error if user cancelled
      if (!errorMessage.includes('cancelled') && !errorMessage.includes('canceled')) {
        setError(errorMessage);
        console.error('Camera error:', err);
      }
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setCapturedPhoto(null);
    setError(null);
  }, []);

  return {
    capturedPhoto,
    isCapturing,
    error,
    takePhoto,
    clearPhoto,
  };
};
