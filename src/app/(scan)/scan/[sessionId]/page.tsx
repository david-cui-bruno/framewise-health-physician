"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useWebRTCSignaling } from "@/hooks/use-webrtc-signaling";
import { useDocumentStability } from "@/hooks/use-document-stability";
import { SIGNAL_EVENTS } from "@/lib/scanner/webrtc-config";

type PhoneStep = "start" | "scanning" | "done";

export default function PhoneScanPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = React.use(params);
  const [step, setStep] = useState<PhoneStep>("start");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [justCaptured, setJustCaptured] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { connectionState, sendMessage } = useWebRTCSignaling({
    sessionId,
    role: "sender",
    localStream,
  });

  // Auto-capture on stable frames
  const { stabilityScore } = useDocumentStability({
    videoRef,
    enabled: step === "scanning" && connectionState === "connected",
    onStableCapture: useCallback((_imageData: string) => {
      setCapturedPages((prev) => {
        const next = [...prev, _imageData];
        sendMessage(SIGNAL_EVENTS.PAGE_CAPTURED, { pageNumber: next.length });
        return next;
      });
      // Flash animation
      setJustCaptured(true);
      setTimeout(() => setJustCaptured(false), 500);
    }, [sendMessage]),
  });

  // Request wake lock to prevent screen sleep
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    if (step === "scanning") {
      navigator.wakeLock?.request("screen").then((wl) => {
        wakeLock = wl;
      }).catch(() => {});
    }
    return () => {
      wakeLock?.release();
    };
  }, [step]);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
      setStep("scanning");
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }

  function retakeLast() {
    setCapturedPages((prev) => prev.slice(0, -1));
  }

  function handleDone() {
    sendMessage(SIGNAL_EVENTS.SCAN_DONE, {
      totalPages: capturedPages.length,
    });
    // Stop camera
    localStream?.getTracks().forEach((t) => t.stop());
    setStep("done");
  }

  // Stability indicator color
  const borderColor =
    stabilityScore > 0.88
      ? "border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.5)]"
      : stabilityScore > 0.75
        ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.3)]"
        : "border-transparent";

  return (
    <div className="fixed inset-0 bg-black flex flex-col" style={{ height: "100dvh" }}>
      {/* Camera viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {/* Stability border overlay */}
        {step === "scanning" && (
          <div
            className={`pointer-events-none absolute inset-4 rounded-xl border-4 transition-all duration-300 ${borderColor}`}
          />
        )}

        {/* Capture flash */}
        {justCaptured && (
          <div className="pointer-events-none absolute inset-0 animate-[fadeOut_0.5s_ease-out] bg-white/50" />
        )}

        {/* Start screen */}
        {step === "start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-center px-8 space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Framewise Scanner
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  Scan each page of the discharge packet.
                  Hold the page steady — it will capture automatically.
                </p>
              </div>
              <button
                onClick={startCamera}
                className="w-full rounded-xl bg-white px-6 py-4 text-base font-semibold text-black active:bg-white/90"
              >
                Start Camera
              </button>
            </div>
          </div>
        )}

        {/* Done screen */}
        {step === "done" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-center px-8 space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">
                Scan Complete
              </h1>
              <p className="text-sm text-white/60">
                {capturedPages.length} page{capturedPages.length !== 1 ? "s" : ""}{" "}
                captured. Return to your desktop to review.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      {step === "scanning" && (
        <div className="safe-area-bottom bg-black/90 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={retakeLast}
              disabled={capturedPages.length === 0}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 disabled:text-white/30"
            >
              Retake Last
            </button>

            <div className="flex items-center gap-2">
              <div className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                {capturedPages.length} page{capturedPages.length !== 1 ? "s" : ""}
              </div>
            </div>

            <button
              onClick={handleDone}
              disabled={capturedPages.length === 0}
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black disabled:bg-white/30 disabled:text-white/50"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
