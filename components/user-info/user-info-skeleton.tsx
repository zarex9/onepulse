"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function UserInfoSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="h-3.5 w-20 rounded" />
      <Skeleton className="h-3.5 w-16 rounded" />
    </div>
  );
}
