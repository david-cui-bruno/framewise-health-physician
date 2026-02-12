"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { RTC_CONFIG, SIGNAL_EVENTS } from "@/lib/scanner/webrtc-config";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface UseWebRTCSignalingOptions {
  sessionId: string;
  role: "sender" | "receiver";
  localStream?: MediaStream | null;
  onRemoteStream?: (stream: MediaStream) => void;
  onPhoneConnected?: () => void;
  onPageCaptured?: (pageNumber: number) => void;
  onScanDone?: (totalPages: number) => void;
}

export type ConnectionState = "new" | "connecting" | "connected" | "disconnected" | "failed";

export function useWebRTCSignaling({
  sessionId,
  role,
  localStream,
  onRemoteStream,
  onPhoneConnected,
  onPageCaptured,
  onScanDone,
}: UseWebRTCSignalingOptions) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("new");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef(createClient());
  const iceCandidateBuffer = useRef<RTCIceCandidateInit[]>([]);
  const hasRemoteDescRef = useRef(false);

  const sendSignal = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      channelRef.current?.send({
        type: "broadcast",
        event,
        payload,
      });
    },
    []
  );

  // Send app-level messages (page-captured, scan-done)
  const sendMessage = useCallback(
    (event: string, payload: Record<string, unknown>) => {
      sendSignal(event, payload);
    },
    [sendSignal]
  );

  useEffect(() => {
    const supabase = supabaseRef.current;
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;

    // Track connection state
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") setConnectionState("connected");
      else if (state === "disconnected") setConnectionState("disconnected");
      else if (state === "failed") setConnectionState("failed");
      else if (state === "connecting") setConnectionState("connecting");
    };

    // ICE candidates → send to remote
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal(SIGNAL_EVENTS.ICE_CANDIDATE, {
          candidate: e.candidate.toJSON(),
        });
      }
    };

    // Receiver: handle incoming tracks
    if (role === "receiver") {
      pc.ontrack = (e) => {
        if (e.streams[0]) {
          onRemoteStream?.(e.streams[0]);
        }
      };
      pc.addTransceiver("video", { direction: "recvonly" });
    }

    // Sender: add local stream tracks
    if (role === "sender" && localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Helper to flush buffered ICE candidates after remote description is set
    async function flushIceCandidates() {
      for (const candidate of iceCandidateBuffer.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch {
          // Ignore stale candidates
        }
      }
      iceCandidateBuffer.current = [];
    }

    // Set up Supabase Realtime channel
    const channel = supabase.channel(`scan:${sessionId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: SIGNAL_EVENTS.OFFER }, async ({ payload }) => {
        if (role !== "receiver" || !payload?.sdp) return;
        try {
          setConnectionState("connecting");
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: "offer", sdp: payload.sdp })
          );
          hasRemoteDescRef.current = true;
          await flushIceCandidates();

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(SIGNAL_EVENTS.ANSWER, { sdp: answer.sdp });
        } catch (err) {
          console.error("Error handling offer:", err);
          setConnectionState("failed");
        }
      })
      .on("broadcast", { event: SIGNAL_EVENTS.ANSWER }, async ({ payload }) => {
        if (role !== "sender" || !payload?.sdp) return;
        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: "answer", sdp: payload.sdp })
          );
          hasRemoteDescRef.current = true;
          await flushIceCandidates();
        } catch (err) {
          console.error("Error handling answer:", err);
        }
      })
      .on(
        "broadcast",
        { event: SIGNAL_EVENTS.ICE_CANDIDATE },
        async ({ payload }) => {
          if (!payload?.candidate) return;
          if (!hasRemoteDescRef.current) {
            iceCandidateBuffer.current.push(payload.candidate);
          } else {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
            } catch {
              // Ignore stale candidates
            }
          }
        }
      )
      .on("broadcast", { event: SIGNAL_EVENTS.PHONE_CONNECTED }, () => {
        onPhoneConnected?.();
      })
      .on("broadcast", { event: SIGNAL_EVENTS.PAGE_CAPTURED }, ({ payload }) => {
        onPageCaptured?.(payload?.pageNumber ?? 0);
      })
      .on("broadcast", { event: SIGNAL_EVENTS.SCAN_DONE }, ({ payload }) => {
        onScanDone?.(payload?.totalPages ?? 0);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;

        // Sender: create and send offer once channel is ready
        if (role === "sender" && localStream) {
          try {
            setConnectionState("connecting");
            sendSignal(SIGNAL_EVENTS.PHONE_CONNECTED, {});
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal(SIGNAL_EVENTS.OFFER, { sdp: offer.sdp });
          } catch (err) {
            console.error("Error creating offer:", err);
            setConnectionState("failed");
          }
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      pc.close();
      pcRef.current = null;
      channelRef.current = null;
      hasRemoteDescRef.current = false;
      iceCandidateBuffer.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, role, localStream]);

  return { connectionState, sendMessage };
}
