import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/Skeleton";

interface BusyBlock {
  start: string;
  end: string;
}

export function CalendarView() {
  const [busy, setBusy] = useState<BusyBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const start = new Date();
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    apiClient
      .get("/calendar/availability", { params: { start: start.toISOString(), end: end.toISOString() } })
      .then((res) => setBusy(res.data.busy))
      .catch(() => setError("Failed to fetch calendar. Please reconnect."));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Your calendar (next 7 days)</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!busy && !error && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}
      {busy && (
        <div className="flex flex-col gap-2">
          {busy.length === 0 && <Card className="p-6 text-center text-gray-500">No busy blocks found — you're wide open!</Card>}
          {busy.map((b, i) => (
            <Card key={i} className="flex items-center justify-between p-4">
              <span className="text-sm font-medium text-gray-900">Busy</span>
              <span className="text-xs text-gray-500">
                {new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleTimeString()}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
