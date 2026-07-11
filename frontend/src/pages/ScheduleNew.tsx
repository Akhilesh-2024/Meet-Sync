import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AttendeeInput } from "../components/scheduling/AttendeeInput";
import { TimeSlotCard } from "../components/scheduling/TimeSlotCard";
import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { suggestSlots, bookSlot } from "../api/scheduling";
import { Slot } from "../types";

const DURATIONS = [15, 30, 60];

export function ScheduleNew() {
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const [suggestions, setSuggestions] = useState<Slot[] | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingIndex, setBookingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleFindTime() {
    if (attendees.length === 0) {
      setError("Add at least one attendee");
      return;
    }
    setError(null);
    setLoading(true);
    setSuggestions(null);
    try {
      const rangeStart = new Date();
      const rangeEnd = new Date(rangeStart.getTime() + 3 * 24 * 60 * 60 * 1000); // search next 3 days
      const res = await suggestSlots({
        attendees,
        duration,
        title: title || "New Meeting",
        range_start: rangeStart.toISOString(),
        range_end: rangeEnd.toISOString(),
      });
      setSuggestions(res.suggestions);
      setMeetingId(res.meeting_id);
      setFallbackUsed(res.fallback_used);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not fetch availability. Please reconnect your calendar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(index: number) {
    if (!meetingId) return;
    setBookingIndex(index);
    try {
      await bookSlot(meetingId, index);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Booking failed. That slot may already be taken.");
    } finally {
      setBookingIndex(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Schedule a meeting</h1>

      <Card className="flex flex-col gap-5 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Weekly sync" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Attendees</label>
          <AttendeeInput attendees={attendees} onChange={setAttendees} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                  duration === d ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={handleFindTime} loading={loading} className="w-full">
          Find Time
        </Button>
      </Card>

      {loading && (
        <div className="mt-6">
          <LoadingSkeleton />
        </div>
      )}

      {suggestions && !loading && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            {suggestions.length === 0
              ? "No common slot found in the next 3 days."
              : fallbackUsed
              ? "No perfect overlap — nearest available time:"
              : "Suggested times"}
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {suggestions.map((slot, i) => (
              <TimeSlotCard key={i} slot={slot} onBook={() => handleBook(i)} booking={bookingIndex === i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
