const iceServers: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// Add TURN relay servers from env (Metered, Twilio, Xirsys, etc.)
const turnUrls = process.env.NEXT_PUBLIC_TURN_URLS;
const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME;
const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

if (turnUrls && turnUsername && turnCredential) {
  iceServers.push({
    urls: turnUrls.split(",").map((u) => u.trim()),
    username: turnUsername,
    credential: turnCredential,
  });
}

export const RTC_CONFIG: RTCConfiguration = { iceServers };

export const SIGNAL_EVENTS = {
  OFFER: "webrtc:offer",
  ANSWER: "webrtc:answer",
  ICE_CANDIDATE: "webrtc:ice-candidate",
  PHONE_CONNECTED: "scan:phone-connected",
  PAGE_CAPTURED: "scan:page-captured",
  SCAN_DONE: "scan:done",
} as const;
