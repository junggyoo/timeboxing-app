"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundManager } from "../lib/sound-manager";
import { useSoundUnlock } from "../hooks/use-sound-unlock";

/**
 * Sound Test Component - For development/debugging purposes only.
 *
 * Usage: Import and add to dashboard temporarily to test sounds.
 * Remove before production deployment.
 */
export function SoundTest() {
  const { isUnlocked, unlock } = useSoundUnlock();
  const [lastPlayed, setLastPlayed] = useState<string | null>(null);

  const handleUnlock = async () => {
    await unlock();
  };

  const playSound = (type: "preStart" | "focusEnd" | "breakEnd") => {
    if (!isUnlocked) {
      alert("AudioContext를 먼저 unlock하세요!");
      return;
    }
    getSoundManager().play(type);
    setLastPlayed(type);
  };

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-72 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {isUnlocked ? (
            <Volume2 className="h-4 w-4 text-green-500" />
          ) : (
            <VolumeX className="h-4 w-4 text-red-500" />
          )}
          Sound Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isUnlocked && (
          <Button onClick={handleUnlock} className="w-full" size="sm">
            Unlock AudioContext
          </Button>
        )}

        {isUnlocked && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => playSound("preStart")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Pre-start
            </Button>
            <Button
              onClick={() => playSound("focusEnd")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Focus End
            </Button>
            <Button
              onClick={() => playSound("breakEnd")}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Break End
            </Button>
          </div>
        )}

        {lastPlayed && (
          <p className="text-xs text-muted-foreground text-center">
            Last played: {lastPlayed}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
