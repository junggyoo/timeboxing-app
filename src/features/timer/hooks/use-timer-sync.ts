"use client";

import { useCallback, useEffect, useRef } from "react";
import { BROADCAST_CHANNEL_NAME } from "../constants";
import type { BroadcastMessage, PersistedTimerState, TickPayload } from "../types";

type UseTimerSyncOptions = {
  onRemoteStart: (state: PersistedTimerState) => void;
  onRemotePause: (pausedMs: number) => void;
  onRemoteResume: () => void;
  onRemoteStop: () => void;
  onRemoteTick: (payload: TickPayload) => void;
  onStateRequest: () => PersistedTimerState | null;
};

export function useTimerSync({
  onRemoteStart,
  onRemotePause,
  onRemoteResume,
  onRemoteStop,
  onRemoteTick,
  onStateRequest,
}: UseTimerSyncOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    const handleMessage = (e: MessageEvent<BroadcastMessage>) => {
      const message = e.data;

      switch (message.type) {
        case "TIMER_STARTED":
          onRemoteStart(message.payload);
          break;
        case "TIMER_PAUSED":
          onRemotePause(message.payload.pausedMs);
          break;
        case "TIMER_RESUMED":
          onRemoteResume();
          break;
        case "TIMER_STOPPED":
          onRemoteStop();
          break;
        case "TIMER_TICK":
          onRemoteTick(message.payload);
          break;
        case "REQUEST_STATE": {
          const state = onStateRequest();
          if (state) {
            channelRef.current?.postMessage({
              type: "STATE_RESPONSE",
              payload: state,
            } as BroadcastMessage);
          }
          break;
        }
        case "STATE_RESPONSE":
          if (message.payload) {
            onRemoteStart(message.payload);
          }
          break;
      }
    };

    channelRef.current.addEventListener("message", handleMessage);

    // Request current state from other tabs when mounting
    channelRef.current.postMessage({ type: "REQUEST_STATE" } as BroadcastMessage);

    return () => {
      if (channelRef.current) {
        channelRef.current.removeEventListener("message", handleMessage);
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [onRemoteStart, onRemotePause, onRemoteResume, onRemoteStop, onRemoteTick, onStateRequest]);

  const broadcastStart = useCallback((state: PersistedTimerState) => {
    channelRef.current?.postMessage({
      type: "TIMER_STARTED",
      payload: state,
    } as BroadcastMessage);
  }, []);

  const broadcastPause = useCallback((pausedMs: number) => {
    channelRef.current?.postMessage({
      type: "TIMER_PAUSED",
      payload: { pausedMs },
    } as BroadcastMessage);
  }, []);

  const broadcastResume = useCallback(() => {
    channelRef.current?.postMessage({
      type: "TIMER_RESUMED",
    } as BroadcastMessage);
  }, []);

  const broadcastStop = useCallback(() => {
    channelRef.current?.postMessage({
      type: "TIMER_STOPPED",
    } as BroadcastMessage);
  }, []);

  const broadcastTick = useCallback((payload: TickPayload) => {
    channelRef.current?.postMessage({
      type: "TIMER_TICK",
      payload,
    } as BroadcastMessage);
  }, []);

  return {
    broadcastStart,
    broadcastPause,
    broadcastResume,
    broadcastStop,
    broadcastTick,
  };
}
