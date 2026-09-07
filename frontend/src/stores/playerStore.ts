import { create } from "zustand";
import { Song } from "../types";

export type PlaybackState = "IDLE" | "LOADING" | "PLAYING" | "PAUSED" | "BUFFERING" | "ERROR";

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: "OFF" | "ALL" | "ONE";
  isQueueOpen: boolean;

  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackState: (state: PlaybackState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleQueue: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  playbackState: "IDLE",
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isShuffle: false,
  repeatMode: "OFF",
  isQueueOpen: false,

  setCurrentSong: (song) => set({ currentSong: song, currentTime: 0, duration: song?.duration || 0 }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackState: (playbackState) => set({ playbackState }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
  toggleRepeat: () => {
    const modes: Array<"OFF" | "ALL" | "ONE"> = ["OFF", "ALL", "ONE"];
    const next = modes[(modes.indexOf(get().repeatMode) + 1) % modes.length];
    set({ repeatMode: next });
  },
  toggleQueue: () => set((state) => ({ isQueueOpen: !state.isQueueOpen })),
}));
