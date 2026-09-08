import { create } from "zustand";
import { apiBaseUrl } from "../api/client";

interface ServerState {
  isServerAwake: boolean;
  isWaking: boolean;
  wakeProgress: number;
  elapsedSeconds: number;
  statusMessage: string;
  triggerWake: () => Promise<boolean>;
  checkServer: () => Promise<boolean>;
}

let activeWakePromise: Promise<boolean> | null = null;
let keepAliveInterval: any = null;

const getHealthUrl = () => {
  return `${apiBaseUrl}/discover/home`;
};

const getActuatorUrl = () => {
  const base = apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  return base ? `${base}/actuator/health` : "/actuator/health";
};

export const useServerStore = create<ServerState>((set, get) => ({
  isServerAwake: false,
  isWaking: false,
  wakeProgress: 0,
  elapsedSeconds: 0,
  statusMessage: "Connecting to server...",

  checkServer: async () => {
    // Quick probe with 3s timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(getHealthUrl(), {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok || res.status === 401 || res.status === 403) {
        set({ isServerAwake: true, isWaking: false, wakeProgress: 100 });
        startKeepAlive();
        return true;
      }
    } catch (e) {
      // Server is asleep or warming up
    }

    // Server not ready, trigger full wake-up loop
    return get().triggerWake();
  },

  triggerWake: () => {
    if (activeWakePromise) {
      return activeWakePromise;
    }

    set({
      isWaking: true,
      isServerAwake: false,
      wakeProgress: 5,
      elapsedSeconds: 0,
      statusMessage: "Waking up cloud server...",
    });

    activeWakePromise = new Promise<boolean>((resolve) => {
      let seconds = 0;

      const timer = setInterval(() => {
        seconds += 1;
        const progress = Math.min(95, Math.floor((seconds / 40) * 90) + (seconds % 3));

        let message = "Waking up cloud server...";
        if (seconds > 6 && seconds <= 15) {
          message = "Spinning up Spring audio engine on Render...";
        } else if (seconds > 15 && seconds <= 28) {
          message = "Connecting to Supabase music database...";
        } else if (seconds > 28 && seconds <= 40) {
          message = "Tuning sound frequencies & warming cache...";
        } else if (seconds > 40) {
          message = "Almost ready! Dropping the beat...";
        }

        set({
          elapsedSeconds: seconds,
          wakeProgress: progress,
          statusMessage: message,
        });
      }, 1000);

      const poll = async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(getActuatorUrl(), {
            method: "GET",
            signal: controller.signal,
          }).catch(() => fetch(getHealthUrl(), { method: "GET", signal: controller.signal }));

          clearTimeout(timeoutId);

          if (res && (res.ok || res.status === 401 || res.status === 403)) {
            clearInterval(timer);
            set({
              wakeProgress: 100,
              statusMessage: "Server Connected! Enjoy the music 🎵",
            });

            setTimeout(() => {
              set({
                isServerAwake: true,
                isWaking: false,
              });
              activeWakePromise = null;
              startKeepAlive();
              resolve(true);
            }, 800);
            return;
          }
        } catch (e) {
          // Still waking up
        }

        // Poll again after 2.5s
        setTimeout(poll, 2500);
      };

      poll();
    });

    return activeWakePromise;
  },
}));

const startKeepAlive = () => {
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  // Ping server every 10 minutes to prevent Render free-tier sleep while tab is open
  keepAliveInterval = setInterval(() => {
    fetch(getHealthUrl(), { method: "GET" }).catch(() => {});
  }, 10 * 60 * 1000);
};
