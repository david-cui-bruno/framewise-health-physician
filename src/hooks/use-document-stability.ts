"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseDocumentStabilityOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  stabilityThreshold?: number; // 0–1, default 0.88
  stableFrameCount?: number; // default 3 (~0.6s at 5fps)
  cooldownMs?: number; // default 2500
  onStableCapture: (imageDataUrl: string) => void;
}

export function useDocumentStability({
  videoRef,
  enabled,
  stabilityThreshold = 0.88,
  stableFrameCount = 3,
  cooldownMs = 2500,
  onStableCapture,
}: UseDocumentStabilityOptions) {
  const [stabilityScore, setStabilityScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const prevDataRef = useRef<ImageData | null>(null);
  const stableCountRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const onStableCaptureRef = useRef(onStableCapture);
  onStableCaptureRef.current = onStableCapture;

  // Compare two frames and return similarity score 0–1
  const computeSimilarity = useCallback(
    (current: ImageData, prev: ImageData): number => {
      let totalDiff = 0;
      const len = current.data.length;
      for (let i = 0; i < len; i += 4) {
        totalDiff += Math.abs(current.data[i] - prev.data[i]); // R
        totalDiff += Math.abs(current.data[i + 1] - prev.data[i + 1]); // G
        totalDiff += Math.abs(current.data[i + 2] - prev.data[i + 2]); // B
      }
      const pixelCount = len / 4;
      const maxDiff = pixelCount * 765; // 255 * 3
      return 1 - totalDiff / maxDiff;
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStabilityScore(0);
      return;
    }

    // Create analysis canvas (small for speed)
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
      ctxRef.current = canvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
    }

    // Create capture canvas (full resolution)
    if (!captureCanvasRef.current) {
      captureCanvasRef.current = document.createElement("canvas");
    }

    const analyzeFrame = () => {
      const video = videoRef.current;
      const ctx = ctxRef.current;
      if (!video || !ctx || video.readyState < 2) return;

      // Draw video frame at low resolution
      ctx.drawImage(video, 0, 0, 160, 120);
      const currentData = ctx.getImageData(0, 0, 160, 120);

      if (!prevDataRef.current) {
        prevDataRef.current = currentData;
        setStabilityScore(0);
        return;
      }

      const score = computeSimilarity(currentData, prevDataRef.current);
      prevDataRef.current = currentData;
      setStabilityScore(score);

      // Check if in cooldown
      if (Date.now() < cooldownUntilRef.current) {
        stableCountRef.current = 0;
        return;
      }

      if (score >= stabilityThreshold) {
        stableCountRef.current++;
        if (stableCountRef.current >= stableFrameCount) {
          // Capture at full resolution
          const captureCanvas = captureCanvasRef.current!;
          captureCanvas.width = video.videoWidth;
          captureCanvas.height = video.videoHeight;
          const captureCtx = captureCanvas.getContext("2d");
          if (captureCtx) {
            captureCtx.drawImage(video, 0, 0);
            const dataUrl = captureCanvas.toDataURL("image/jpeg", 0.85);
            onStableCaptureRef.current(dataUrl);
          }

          stableCountRef.current = 0;
          cooldownUntilRef.current = Date.now() + cooldownMs;
        }
      } else {
        stableCountRef.current = 0;
      }
    };

    // Run at ~5fps
    intervalRef.current = setInterval(analyzeFrame, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    enabled,
    videoRef,
    stabilityThreshold,
    stableFrameCount,
    cooldownMs,
    computeSimilarity,
  ]);

  return { stabilityScore };
}
