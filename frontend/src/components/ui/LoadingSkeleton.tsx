import { Skeleton } from "./Skeleton";

export function LoadingSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 w-56 shrink-0" />
      ))}
    </div>
  );
}
