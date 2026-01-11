/**
 * NotificationManager - Manages browser notifications with toast fallback.
 *
 * Strategy:
 * 1. Check if Notification API is supported
 * 2. Request permission if not yet granted
 * 3. If granted: use native Notification
 * 4. If denied or unsupported: fall back to toast UI
 * 5. On notification click: focus the window
 */

type NotificationOptions = {
  title: string;
  body: string;
  tag?: string;
  requireInteraction?: boolean;
  onClick?: () => void;
};

type ToastFn = (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;

class NotificationManager {
  private static instance: NotificationManager;
  private toastFn: ToastFn | null = null;

  private constructor() {}

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Set the toast function for fallback notifications.
   * Must be called with the toast function from useToast hook.
   */
  setToastFn(fn: ToastFn): void {
    this.toastFn = fn;
  }

  /**
   * Check if Notification API is supported
   */
  get isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * Get current notification permission status
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported) return "denied";
    return Notification.permission;
  }

  /**
   * Request notification permission from the user.
   * Returns the permission result.
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn("Notification API not supported");
      return "denied";
    }

    // Already have a definitive answer
    if (Notification.permission !== "default") {
      return Notification.permission;
    }

    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied";
    }
  }

  /**
   * Show a notification (native or toast fallback).
   */
  show(options: NotificationOptions): void {
    const { title, body, tag, requireInteraction = false, onClick } = options;

    // Try native notification if permission granted
    if (this.isSupported && Notification.permission === "granted") {
      this.showNative({ title, body, tag, requireInteraction, onClick });
    } else {
      // Fallback to toast
      this.showToast({ title, body });
    }
  }

  /**
   * Show a native browser notification
   */
  private showNative(options: NotificationOptions): Notification | null {
    const { title, body, tag, requireInteraction, onClick } = options;

    try {
      const notification = new Notification(title, {
        body,
        tag,
        requireInteraction,
        icon: "/easynext.png", // Use existing app icon
      });

      notification.onclick = () => {
        // Focus the window/tab
        window.focus();
        // Close the notification
        notification.close();
        // Call custom handler if provided
        onClick?.();
      };

      // Auto-close after 5 seconds if not requiring interaction
      if (!requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error("Failed to show native notification:", error);
      // Fallback to toast
      this.showToast({ title, body });
      return null;
    }
  }

  /**
   * Show a toast notification (fallback)
   */
  private showToast(options: Pick<NotificationOptions, "title" | "body">): void {
    if (this.toastFn) {
      this.toastFn({
        title: options.title,
        description: options.body,
      });
    } else {
      // Last resort: console log if toast not available
      console.log(`[Notification] ${options.title}: ${options.body}`);
    }
  }

  /**
   * Show a pre-start reminder notification
   */
  showPreStart(taskTitle: string): void {
    this.show({
      title: "Starting soon!",
      body: `"${taskTitle}" begins in 5 minutes`,
      tag: "prestart",
    });
  }

  /**
   * Show a focus timer completed notification
   */
  showFocusEnd(taskTitle: string): void {
    this.show({
      title: "Time's up! 🎉",
      body: `Great work on "${taskTitle}"! Take a short break.`,
      tag: "focus-end",
      requireInteraction: true,
    });
  }

  /**
   * Show a break ended notification
   */
  showBreakEnd(): void {
    this.show({
      title: "Break over!",
      body: "Ready to focus again?",
      tag: "break-end",
      requireInteraction: true,
    });
  }
}

// Export singleton instance getter
export const getNotificationManager = () => NotificationManager.getInstance();

// Export class for type references
export { NotificationManager };
