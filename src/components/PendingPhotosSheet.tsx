import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Upload, Loader2, Clock } from 'lucide-react';
import type { QueuedPhoto } from '@/hooks/usePhotoQueue';

interface PendingPhotosSheetProps {
  queue: QueuedPhoto[];
  pendingCount: number;
  isSyncing: boolean;
  onRetryAll: () => void;
  children: React.ReactNode;
}

const PendingPhotosSheet: React.FC<PendingPhotosSheetProps> = ({
  queue,
  pendingCount,
  isSyncing,
  onRetryAll,
  children,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DrawerTitle>Pending Uploads</DrawerTitle>
              <Badge variant="secondary">{pendingCount}</Badge>
            </div>
            <Button
              size="sm"
              onClick={onRetryAll}
              disabled={isSyncing || pendingCount === 0}
              className="gap-2"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry All
            </Button>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4 py-4" style={{ maxHeight: '60vh' }}>
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Upload className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">No pending uploads</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {queue.map((photo) => (
                <div
                  key={photo.id}
                  className="relative rounded-lg overflow-hidden border border-border bg-card"
                >
                  <img
                    src={photo.dataUrl}
                    alt="Pending upload"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="flex items-center justify-between text-xs text-white">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(photo.timestamp)}
                      </span>
                      {photo.retryCount > 0 && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Retry {photo.retryCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isSyncing && queue[0]?.id === photo.id && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default PendingPhotosSheet;
