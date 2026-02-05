import { useState, useEffect, useCallback, useRef } from 'react';

export interface QueuedPhoto {
  id: string;
  dataUrl: string;
  storeId: string;
  userId: string;
  timestamp: number;
  retryCount: number;
}

interface UsePhotoQueueReturn {
  queue: QueuedPhoto[];
  pendingCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  addToQueue: (photo: Omit<QueuedPhoto, 'id' | 'timestamp' | 'retryCount'>) => void;
  retryAll: () => void;
}

const QUEUE_STORAGE_KEY = 'pizza-analyzer-photo-queue';
const MAX_RETRIES = 3;
const SYNC_INTERVAL = 5000; // Check every 5 seconds

// Mock upload function - replace with your real API
const mockUploadPhoto = async (photo: QueuedPhoto): Promise<boolean> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Simulate 90% success rate when online
  if (navigator.onLine && Math.random() > 0.1) {
    console.log(`[Mock API] Photo ${photo.id} uploaded successfully`);
    return true;
  }
  
  console.log(`[Mock API] Photo ${photo.id} upload failed`);
  return false;
};

export const usePhotoQueue = (): UsePhotoQueueReturn => {
  const [queue, setQueue] = useState<QueuedPhoto[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncingRef = useRef(false);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch {
        localStorage.removeItem(QUEUE_STORAGE_KEY);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync queue when online
  useEffect(() => {
    const syncQueue = async () => {
      if (!isOnline || queue.length === 0 || syncingRef.current) {
        return;
      }

      syncingRef.current = true;
      setIsSyncing(true);

      const photoToSync = queue[0];
      
      try {
        const success = await mockUploadPhoto(photoToSync);
        
        if (success) {
          setQueue(prev => prev.filter(p => p.id !== photoToSync.id));
        } else if (photoToSync.retryCount < MAX_RETRIES) {
          // Move to end of queue with incremented retry count
          setQueue(prev => [
            ...prev.filter(p => p.id !== photoToSync.id),
            { ...photoToSync, retryCount: photoToSync.retryCount + 1 }
          ]);
        } else {
          // Max retries reached, remove from queue
          console.error(`Photo ${photoToSync.id} failed after ${MAX_RETRIES} retries`);
          setQueue(prev => prev.filter(p => p.id !== photoToSync.id));
        }
      } catch (error) {
        console.error('Sync error:', error);
      }

      syncingRef.current = false;
      setIsSyncing(false);
    };

    const intervalId = setInterval(syncQueue, SYNC_INTERVAL);
    
    // Also try to sync immediately when coming back online
    if (isOnline && queue.length > 0) {
      syncQueue();
    }

    return () => clearInterval(intervalId);
  }, [isOnline, queue]);

  const addToQueue = useCallback((photo: Omit<QueuedPhoto, 'id' | 'timestamp' | 'retryCount'>) => {
    const newPhoto: QueuedPhoto = {
      ...photo,
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setQueue(prev => [...prev, newPhoto]);
  }, []);

  const retryAll = useCallback(() => {
    // Reset retry counts to give all photos a fresh chance
    setQueue(prev => prev.map(photo => ({ ...photo, retryCount: 0 })));
  }, []);

  return {
    queue,
    pendingCount: queue.length,
    isOnline,
    isSyncing,
    addToQueue,
    retryAll,
  };
};
