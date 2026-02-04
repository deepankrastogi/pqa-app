import { useCallback } from 'react';

// Detection interface for backend integration
export interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

interface UseDetectionOverlayReturn {
  drawDetections: (
    ctx: CanvasRenderingContext2D, 
    detections: Detection[],
    scaleX: number,
    scaleY: number
  ) => void;
}

/**
 * Hook for rendering detection bounding boxes on a canvas overlay.
 * Your backend team can call drawDetections() with detection results from your API.
 */
export const useDetectionOverlay = (): UseDetectionOverlayReturn => {
  const drawDetections = useCallback((
    ctx: CanvasRenderingContext2D,
    detections: Detection[],
    scaleX: number,
    scaleY: number
  ) => {
    // Clear previous drawings
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Scale coordinates to canvas size
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledWidth = width * scaleX;
      const scaledHeight = height * scaleY;
      
      // Draw yellow bounding box
      ctx.strokeStyle = '#FBBF24'; // Yellow-400
      ctx.lineWidth = 3;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
      
      // Draw corner accents for a more professional look
      const cornerLength = Math.min(20, scaledWidth / 4, scaledHeight / 4);
      ctx.lineWidth = 4;
      
      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(scaledX, scaledY + cornerLength);
      ctx.lineTo(scaledX, scaledY);
      ctx.lineTo(scaledX + cornerLength, scaledY);
      ctx.stroke();
      
      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY);
      ctx.lineTo(scaledX + scaledWidth, scaledY);
      ctx.lineTo(scaledX + scaledWidth, scaledY + cornerLength);
      ctx.stroke();
      
      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(scaledX, scaledY + scaledHeight - cornerLength);
      ctx.lineTo(scaledX, scaledY + scaledHeight);
      ctx.lineTo(scaledX + cornerLength, scaledY + scaledHeight);
      ctx.stroke();
      
      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(scaledX + scaledWidth - cornerLength, scaledY + scaledHeight);
      ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
      ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - cornerLength);
      ctx.stroke();
      
      // Draw label background
      const label = `${detection.class} ${Math.round(detection.score * 100)}%`;
      ctx.font = 'bold 14px sans-serif';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;
      const padding = 6;
      
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(
        scaledX, 
        scaledY - textHeight - padding, 
        textMetrics.width + padding * 2, 
        textHeight + padding
      );
      
      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, scaledX + padding, scaledY - padding);
    });
  }, []);

  return {
    drawDetections,
  };
};
