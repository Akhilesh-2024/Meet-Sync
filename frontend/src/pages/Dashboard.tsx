import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMeetingStore } from "../stores/meetingStore";
import { useAuthStore } from "../stores/authStore";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export function Dashboard() {
  const { meetings, isLoading, loadMeetings } = useMeetingStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back{user ? `, ${user.displayName}` : ""}</h1>
          <p className="text-sm text-gray-500">Here's what's on your schedule.</p>
        </div>
        <Link to="/schedule/new">
          <Button>+ New Meeting</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No meetings yet — create your first one!</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((m) => (
            <Card key={m._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{m.title}</p>
                <p className="text-xs text-gray-500">
                  {m.duration} min · {m.finalSlot ? new Date(m.finalSlot.start).toLocaleString() : `${m.suggestedSlots.length} suggested slots`}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[m.status]}`}>{m.status}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
