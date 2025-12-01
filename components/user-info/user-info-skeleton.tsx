"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const UserInfoSkeleton = memo(() => (
  <div className="flex flex-col gap-1">
    <Skeleton className="h-3.5 w-20 rounded" />
    <Skeleton className="h-3.5 w-16 rounded" />
  </div>
));
