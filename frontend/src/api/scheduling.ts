import { apiClient } from "./client";
import { Meeting, Slot } from "../types";

export async function suggestSlots(payload: {
  attendees: string[];
  duration: number;
  range_start: string;
  range_end: string;
  title?: string;
}): Promise<{ meeting_id: string; suggestions: Slot[]; fallback_used: boolean }> {
  const { data } = await apiClient.post("/suggest", payload);
  return data;
}

export async function bookSlot(meetingId: string, slotIndex: number) {
  const { data } = await apiClient.post("/book", { meeting_id: meetingId, slot_index: slotIndex });
  return data;
}

export async function fetchMeetings(status?: string): Promise<{ meetings: Meeting[] }> {
  const { data } = await apiClient.get("/meetings", { params: { status } });
  return data;
}
