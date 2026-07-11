import { findAvailableSlots, mergeBusyPeriods, combineAllBusyPeriods } from "../services/scheduler.service";

const d = (iso: string) => new Date(iso);

describe("mergeBusyPeriods", () => {
  it("merges overlapping periods", () => {
    const merged = mergeBusyPeriods([
      { start: d("2026-07-25T09:00:00Z"), end: d("2026-07-25T10:00:00Z") },
      { start: d("2026-07-25T09:30:00Z"), end: d("2026-07-25T11:00:00Z") },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].end).toEqual(d("2026-07-25T11:00:00Z"));
  });

  it("keeps non-overlapping periods separate", () => {
    const merged = mergeBusyPeriods([
      { start: d("2026-07-25T09:00:00Z"), end: d("2026-07-25T10:00:00Z") },
      { start: d("2026-07-25T12:00:00Z"), end: d("2026-07-25T13:00:00Z") },
    ]);
    expect(merged).toHaveLength(2);
  });
});

describe("combineAllBusyPeriods", () => {
  it("combines busy periods for multiple attendees", () => {
    const combined = combineAllBusyPeriods({
      alice: [{ start: d("2026-07-25T09:00:00Z"), end: d("2026-07-25T10:00:00Z") }],
      bob: [{ start: d("2026-07-25T09:30:00Z"), end: d("2026-07-25T11:00:00Z") }],
    });
    expect(combined).toHaveLength(1);
  });
});

describe("findAvailableSlots", () => {
  it("finds the earliest free slot for a single attendee", () => {
    const slots = findAvailableSlots({
      attendeeBusyPeriods: {
        alice: [{ start: d("2026-07-25T09:00:00Z"), end: d("2026-07-25T10:00:00Z") }],
      },
      durationMinutes: 30,
      rangeStart: d("2026-07-25T09:00:00Z"),
      rangeEnd: d("2026-07-25T12:00:00Z"),
    });
    expect(slots[0].start).toEqual(d("2026-07-25T10:00:00Z"));
    expect(slots[0].end).toEqual(d("2026-07-25T10:30:00Z"));
  });

  it("returns no slots when the whole range is busy", () => {
    const slots = findAvailableSlots({
      attendeeBusyPeriods: {
        alice: [{ start: d("2026-07-25T09:00:00Z"), end: d("2026-07-25T12:00:00Z") }],
      },
      durationMinutes: 30,
      rangeStart: d("2026-07-25T09:00:00Z"),
      rangeEnd: d("2026-07-25T12:00:00Z"),
    });
    expect(slots).toHaveLength(0);
  });

  it("respects maxSuggestions", () => {
    const slots = findAvailableSlots({
      attendeeBusyPeriods: {},
      durationMinutes: 15,
      rangeStart: d("2026-07-25T09:00:00Z"),
      rangeEnd: d("2026-07-25T12:00:00Z"),
      maxSuggestions: 2,
    });
    expect(slots).toHaveLength(2);
  });

  it("finds overlap across multiple attendees", () => {
    const slots = findAvailableSlots({
      attendeeBusyPeriods: {
        alice: [{ start: d("2026-07-25T09:00:00Z"), end: d("2026-07-25T10:00:00Z") }],
        bob: [{ start: d("2026-07-25T10:00:00Z"), end: d("2026-07-25T10:30:00Z") }],
      },
      durationMinutes: 30,
      rangeStart: d("2026-07-25T09:00:00Z"),
      rangeEnd: d("2026-07-25T12:00:00Z"),
    });
    expect(slots[0].start).toEqual(d("2026-07-25T10:30:00Z"));
  });

  it("throws on invalid duration", () => {
    expect(() =>
      findAvailableSlots({
        attendeeBusyPeriods: {},
        durationMinutes: 0,
        rangeStart: d("2026-07-25T09:00:00Z"),
        rangeEnd: d("2026-07-25T12:00:00Z"),
      })
    ).toThrow();
  });
});
