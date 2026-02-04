import { useState, useRef, useCallback, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// COCO-SSD classes that are food-related
const FOOD_CLASSES = [
  'banana', 'apple', 'sandwich', 'orange', 'broccoli', 
  'carrot', 'hot dog', 'pizza', 'donut', 'cake',
  'bowl', 'cup', 'fork', 'knife', 'spoon',
  'bottle', 'wine glass', 'dining table'
];

export interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

interface UseFoodDetectionReturn {
  isModelLoading: boolean;
  isDetecting: boolean;
  detections: Detection[];
  modelError: string | null;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
  drawDetections: (
    ctx: CanvasRenderingContext2D, 
    detections: Detection[],
    scaleX: number,
    scaleY: number
  ) => void;
}

export const useFoodDetection = (): UseFoodDetectionReturn => {
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [modelError, setModelError] = useState<string | null>(null);

  // Load the COCO-SSD model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        // Initialize TensorFlow.js
        await tf.ready();
        
        // Load the model (lite version for faster loading)
        const model = await cocoSsd.load({
          base: 'lite_mobilenet_v2'
        });
        
        modelRef.current = model;
        setIsModelLoading(false);
        console.log('COCO-SSD model loaded successfully');
      } catch (err) {
        console.error('Failed to load detection model:', err);
        setModelError('Failed to load AI model. Detection unavailable.');
        setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const detectFrame = useCallback(async () => {
    if (!modelRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    
    if (video.readyState !== 4) {
      // Video not ready, try again
      animationFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    try {
      // Run detection
      const predictions = await modelRef.current.detect(video);
      
      // Filter for food-related items
      const foodDetections: Detection[] = predictions
        .filter(pred => FOOD_CLASSES.includes(pred.class) && pred.score > 0.5)
        .map(pred => ({
          bbox: pred.bbox as [number, number, number, number],
          class: pred.class,
          score: pred.score,
        }));
      
      setDetections(foodDetections);
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Continue detection loop (throttled to ~10fps for performance)
    setTimeout(() => {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    }, 100);
  }, []);

  const startDetection = useCallback((video: HTMLVideoElement) => {
    if (!modelRef.current) {
      console.warn('Model not loaded yet');
      return;
    }
    
    videoRef.current = video;
    setIsDetecting(true);
    detectFrame();
  }, [detectFrame]);

  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsDetecting(false);
    setDetections([]);
  }, []);

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
    isModelLoading,
    isDetecting,
    detections,
    modelError,
    startDetection,
    stopDetection,
    drawDetections,
  };
};
