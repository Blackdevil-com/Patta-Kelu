import { useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/playerStore";
import { useQueueStore } from "../stores/queueStore";
import { api } from "../api/client";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    setIsPlaying,
    setPlaybackState,
    setCurrentTime,
    setDuration,
    setCurrentSong,
  } = usePlayerStore();

  const { nextTrack, previousTrack } = useQueueStore();

  // Create single HTML5 Audio element instance
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || currentSong?.duration || 0);
      setPlaybackState("PLAYING");
    };

    const onWaiting = () => {
      setPlaybackState("BUFFERING");
    };

    const onPlaying = () => {
      setPlaybackState("PLAYING");
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
      setPlaybackState("PAUSED");
    };

    const onError = () => {
      setPlaybackState("ERROR");
      setIsPlaying(false);
    };

    const onEnded = () => {
      // Record playback event to backend
      if (currentSong) {
        api.post(`/songs/${currentSong.id}/play`, {
          durationPlayed: Math.floor(audio.currentTime),
          completed: true,
        }).catch(() => {});
      }

      const next = nextTrack(isShuffle, repeatMode);
      if (next) {
        setCurrentSong(next);
      } else {
        setIsPlaying(false);
        setPlaybackState("IDLE");
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  // Update source when currentSong changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
      setPlaybackState("LOADING");
      audio.src = currentSong.streamUrl;
      audio.load();
      audio.play().catch(() => {
        setIsPlaying(false);
        setPlaybackState("PAUSED");
      });
    } else {
      audio.pause();
      audio.src = "";
      setPlaybackState("IDLE");
    }
  }, [currentSong?.id]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle volume / mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const seek = (timeInSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = timeInSeconds;
    setCurrentTime(timeInSeconds);
  };

  const playNext = () => {
    const next = nextTrack(isShuffle, repeatMode);
    if (next) setCurrentSong(next);
  };

  const playPrev = () => {
    const prev = previousTrack();
    if (prev) setCurrentSong(prev);
  };

  const togglePlay = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };

  return {
    seek,
    playNext,
    playPrev,
    togglePlay,
  };
};
