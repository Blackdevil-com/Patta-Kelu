import React from "react";
import { useServerStore } from "../../stores/serverStore";
import { Disc3, Volume2 } from "lucide-react";

export const ServerWakeOverlay: React.FC = () => {
  const { isWaking, wakeProgress, elapsedSeconds, statusMessage } = useServerStore();

  if (!isWaking) return null;

  // 24 animated equalizer bars with staggered delays and base heights
  const bars = Array.from({ length: 24 }, (_, i) => {
    // Varied animation duration and delay to create organic wave effect
    const delay = (i * 0.05).toFixed(2);
    const duration = (0.8 + (i % 5) * 0.15).toFixed(2);
    return { id: i, delay, duration };
  });

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl px-6 text-center select-none animate-fadeIn">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -top-24" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-spotify-green/10 blur-[100px] pointer-events-none bottom-0" />

      <div className="relative flex flex-col items-center max-w-lg w-full z-10 space-y-8">
        
        {/* Vinyl & Sound Wave Radiator */}
        <div className="relative flex items-center justify-center w-36 h-36">
          {/* Concentric sound ripples */}
          <div className="absolute inset-0 rounded-full border border-spotify-green/30 animate-sound-ripple-1" />
          <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-sound-ripple-2" />
          <div className="absolute inset-0 rounded-full border border-spotify-green/10 animate-sound-ripple-3" />

          {/* Vinyl Disc */}
          <div className="relative w-28 h-28 rounded-full bg-neutral-900 border-2 border-neutral-800 shadow-2xl flex items-center justify-center animate-spin-slow">
            {/* Vinyl record grooves */}
            <div className="absolute inset-2 rounded-full border border-neutral-800/80" />
            <div className="absolute inset-4 rounded-full border border-neutral-800/60" />
            <div className="absolute inset-6 rounded-full border border-neutral-800/40" />

            {/* Center Label */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-spotify-green flex items-center justify-center shadow-lg">
              <Disc3 className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        {/* Music Equalizer Visualizer Spectrum */}
        <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-xs px-2 py-1">
          {bars.map((bar) => (
            <div
              key={bar.id}
              className="w-1.5 rounded-full bg-gradient-to-t from-emerald-600 via-spotify-green to-emerald-300 animate-music-bar shadow-sm shadow-spotify-green/50"
              style={{
                animationDelay: `${bar.delay}s`,
                animationDuration: `${bar.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-spotify-green" />
          </span>
          <span className="text-neutral-200">Cloud Server Warming Up</span>
          <span className="text-neutral-500">•</span>
          <span className="text-spotify-green font-semibold">{elapsedSeconds}s</span>
        </div>

        {/* Title and Dynamic Message */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Tuning into Patta Kelu</span>
            <Volume2 className="w-6 h-6 text-spotify-green animate-pulse" />
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-medium transition-all duration-300 min-h-[1.5rem]">
            {statusMessage}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full space-y-2">
          <div className="h-2 w-full bg-neutral-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-spotify-green rounded-full transition-all duration-500 ease-out shadow-lg shadow-spotify-green/50"
              style={{ width: `${Math.max(5, wakeProgress)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 font-medium px-1">
            <span>Waking instance (~30–45s)</span>
            <span className="text-spotify-green">{wakeProgress}%</span>
          </div>
        </div>

        {/* Free Tier Info Note */}
        <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs text-neutral-400 leading-relaxed">
          💡 <strong className="text-neutral-300">Render Free Tier Notice:</strong> The cloud server spins down after 15 minutes of idle time. The application is waking it up now and will automatically resume!
        </div>

      </div>
    </div>
  );
};
