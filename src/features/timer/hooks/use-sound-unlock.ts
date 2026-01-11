"use client";

import { useCallback, useEffect, useState } from "react";
import { getSoundManager } from "../lib/sound-manager";

/**
 * Hook to manage AudioContext unlocking for sound playback.
 *
 * Browsers require user interaction before playing audio.
 * This hook unlocks the AudioContext on the first click/touch/keypress.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { isUnlocked, unlock } = useSoundUnlock();
 *
 *   // AudioContext is automatically unlocked on first interaction
 *   // Or manually trigger unlock on a specific action:
 *   const handleStartTimer = () => {
 *     unlock();
 *     // ... start timer
 *   };
 * }
 * ```
 */
export function useSoundUnlock() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check initial state on mount
  useEffect(() => {
    setIsUnlocked(getSoundManager().unlocked);
  }, []);

  // Manual unlock function
  const unlock = useCallback(async () => {
    if (isUnlocked) return;

    await getSoundManager().unlock();
    setIsUnlocked(getSoundManager().unlocked);
  }, [isUnlocked]);

  // Auto-unlock on first user interaction
  useEffect(() => {
    if (isUnlocked) return;

    const handleInteraction = async () => {
      await getSoundManager().unlock();
      setIsUnlocked(getSoundManager().unlocked);

      // Remove listeners after successful unlock
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction, { passive: true });
    document.addEventListener("touchstart", handleInteraction, { passive: true });
    document.addEventListener("keydown", handleInteraction, { passive: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [isUnlocked]);

  return { isUnlocked, unlock };
}
