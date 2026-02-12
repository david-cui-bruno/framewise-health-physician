"use client";

import { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import type { ConnectionState } from "@/hooks/use-webrtc-signaling";

interface ScanningStepProps {
  remoteStream: MediaStream | null;
  capturedPageCount: number;
  connectionState: ConnectionState;
}

export function ScanningStep({
  remoteStream,
  capturedPageCount,
  connectionState,
}: ScanningStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4" />
            Scanning Discharge Packet
          </CardTitle>
          <Badge variant="secondary">
            {capturedPageCount} page
            {capturedPageCount !== 1 ? "s" : ""} captured
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-contain"
          />
          {connectionState !== "connected" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <p className="text-white text-sm">
                Connecting to phone camera...
              </p>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Hold each page of the discharge packet steady in front of your phone
          camera. Pages will be captured automatically.
        </p>
      </CardContent>
    </Card>
  );
}
