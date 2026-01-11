"use client";

import { useCallback, useEffect, useState } from "react";
import { getNotificationManager } from "../lib/notification-manager";

/**
 * Hook to manage browser notification permissions.
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { permission, isSupported, requestPermission } = useNotificationPermission();
 *
 *   if (permission === 'default') {
 *     return <button onClick={requestPermission}>Enable Notifications</button>;
 *   }
 * }
 * ```
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  // Check initial state on mount
  useEffect(() => {
    const manager = getNotificationManager();
    setIsSupported(manager.isSupported);
    setPermission(manager.getPermission());
  }, []);

  // Request permission from user
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await getNotificationManager().requestPermission();
    setPermission(result);
    return result;
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    isDefault: permission === "default",
  };
}
