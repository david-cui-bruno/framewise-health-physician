"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Play,
  Square,
} from "lucide-react";

type UpdateState = "idle" | "loading" | "success";

function AudioPlayButton({ src, label }: { src: string; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      audio.currentTime = 0;
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        title={`Play "${label}"`}
      >
        {playing ? (
          <Square className="h-3 w-3 fill-current" />
        ) : (
          <Play className="h-3 w-3 fill-current" />
        )}
        {playing ? "Stop" : "Play audio"}
      </button>
    </>
  );
}

export function AIInsights() {
  const [updateState, setUpdateState] = useState<UpdateState>("idle");

  function handleUpdateLibrary() {
    setUpdateState("loading");
    setTimeout(() => {
      setUpdateState("success");
    }, 1500);
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Smart Insights
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            2 signals detected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signal: Low Self-Efficacy */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-900">
                Low Self-Efficacy Signal
              </p>
              <p className="text-sm text-amber-800">
                Patient replayed the{" "}
                <span className="font-semibold">
                  &ldquo;Medication Safety&rdquo;
                </span>{" "}
                segment{" "}
                <span className="font-semibold">3 times</span> — this
                indicates difficulty understanding the material. Consider
                simplifying technical language.
              </p>
            </div>
          </div>
        </div>

        {/* Suggestion: Language Simplification */}
        <div className="rounded-lg border bg-white p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Suggested content update
          </p>
          <div className="flex items-center gap-3 text-sm">
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs text-muted-foreground mb-0.5">Current</p>
              <p className="font-medium text-red-800">
                &ldquo;low blood pressure&rdquo;
              </p>
              <AudioPlayButton
                src="/audio/current.mp3"
                label="low blood pressure"
              />
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2">
              <p className="text-xs text-muted-foreground mb-0.5">Suggested</p>
              <p className="font-medium text-green-800">
                &ldquo;feeling dizzy when standing up&rdquo;
              </p>
              <AudioPlayButton
                src="/audio/suggested.mp3"
                label="feeling dizzy when standing up"
              />
            </div>
          </div>

          <div className="mt-4">
            {updateState === "idle" && (
              <Button onClick={handleUpdateLibrary} size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Update Library
              </Button>
            )}
            {updateState === "loading" && (
              <Button disabled size="sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </Button>
            )}
            {updateState === "success" && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                Library updated — simplified language applied
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
