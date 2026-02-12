"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";

interface ConnectPhoneStepProps {
  sessionId: string;
  phoneConnected: boolean;
}

export function ConnectPhoneStep({
  sessionId,
  phoneConnected,
}: ConnectPhoneStepProps) {
  const [scanUrl, setScanUrl] = useState("");

  useEffect(() => {
    const tunnelBase = process.env.NEXT_PUBLIC_TUNNEL_URL;
    console.log("[QR] NEXT_PUBLIC_TUNNEL_URL =", JSON.stringify(tunnelBase));
    if (tunnelBase) {
      // Use the tunnel URL (ngrok/localtunnel) for HTTPS on the phone
      setScanUrl(`${tunnelBase.replace(/\/$/, "")}/scan/${sessionId}`);
    } else {
      // Fallback: LAN IP (only works if phone can reach the server)
      fetch("/api/local-ip")
        .then((r) => r.json())
        .then(({ ip }) => {
          const port = window.location.port || "3000";
          setScanUrl(`http://${ip}:${port}/scan/${sessionId}`);
        })
        .catch(() => {
          setScanUrl(`${window.location.origin}/scan/${sessionId}`);
        });
    }
  }, [sessionId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Connect Your Phone
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {!phoneConnected ? (
          <>
            {scanUrl && (
              <div className="rounded-xl border-2 border-dashed p-4">
                <QRCodeSVG value={scanUrl} size={200} level="M" />
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your phone camera
              </p>
              <p className="text-xs text-muted-foreground">
                Your phone will open a scanner to capture the discharge packet
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Waiting for phone to connect...
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 py-4">
            <CheckCircle2 className="h-5 w-5" />
            Phone connected! Starting camera...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
