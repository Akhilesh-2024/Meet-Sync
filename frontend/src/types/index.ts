export interface User {
  _id: string;
  email: string;
  displayName: string;
  timezone: string;
  authProvider: "GOOGLE" | "EMAIL";
}

export interface Slot {
  start: string;
  end: string;
}

export interface Meeting {
  _id: string;
  title: string;
  duration: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  suggestedSlots: Slot[];
  finalSlot?: Slot;
  createdAt: string;
}
