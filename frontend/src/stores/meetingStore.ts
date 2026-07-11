import { create } from "zustand";
import { Meeting } from "../types";
import { fetchMeetings } from "../api/scheduling";

interface MeetingState {
  meetings: Meeting[];
  isLoading: boolean;
  loadMeetings: () => Promise<void>;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  meetings: [],
  isLoading: false,
  loadMeetings: async () => {
    set({ isLoading: true });
    try {
      const { meetings } = await fetchMeetings();
      set({ meetings, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
