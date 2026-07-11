import { Slot } from "../../types";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

interface TimeSlotCardProps {
  slot: Slot;
  onBook: () => void;
  booking?: boolean;
}

export function TimeSlotCard({ slot, onBook, booking }: TimeSlotCardProps) {
  const start = new Date(slot.start);
  const end = new Date(slot.end);
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <Card className="flex min-w-[220px] flex-col gap-3 p-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{fmt.format(start)}</p>
        <p className="text-xs text-gray-500">
          to {end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} · {localTz}
        </p>
      </div>
      <Button onClick={onBook} loading={booking} className="w-full">
        Book this slot
      </Button>
    </Card>
  );
}
