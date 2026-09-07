import { create } from "zustand";
import { Song } from "../types";

interface QueueState {
  queue: Song[];
  currentIndex: number;
  history: Song[];

  setQueue: (songs: Song[], startIndex?: number) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  nextTrack: (isShuffle?: boolean, repeatMode?: "OFF" | "ALL" | "ONE") => Song | null;
  previousTrack: () => Song | null;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  history: [],

  setQueue: (songs, startIndex = 0) => {
    set({ queue: songs, currentIndex: startIndex });
  },

  addToQueue: (song) => {
    set((state) => ({ queue: [...state.queue, song] }));
  },

  removeFromQueue: (index) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
      currentIndex: index < state.currentIndex ? state.currentIndex - 1 : state.currentIndex,
    }));
  },

  clearQueue: () => set({ queue: [], currentIndex: 0, history: [] }),

  nextTrack: (isShuffle = false, repeatMode = "OFF") => {
    const { queue, currentIndex, history } = get();
    if (queue.length === 0) return null;

    if (repeatMode === "ONE") {
      return queue[currentIndex] || null;
    }

    let nextIdx: number;
    if (isShuffle && queue.length > 1) {
      let rand = Math.floor(Math.random() * queue.length);
      while (rand === currentIndex) {
        rand = Math.floor(Math.random() * queue.length);
      }
      nextIdx = rand;
    } else {
      nextIdx = currentIndex + 1;
    }

    if (nextIdx >= queue.length) {
      if (repeatMode === "ALL") {
        nextIdx = 0;
      } else {
        return null; // queue finished
      }
    }

    const currentSong = queue[currentIndex];
    set({
      currentIndex: nextIdx,
      history: currentSong ? [...history, currentSong] : history,
    });
    return queue[nextIdx] || null;
  },

  previousTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return null;

    const prevIdx = currentIndex > 0 ? currentIndex - 1 : 0;
    set({ currentIndex: prevIdx });
    return queue[prevIdx] || null;
  },
}));
