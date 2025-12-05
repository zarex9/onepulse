"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminAccessDeniedProps = {
  address?: string;
  owner?: string;
};

export function AdminAccessDenied({ address, owner }: AdminAccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Only the contract owner can access this admin dashboard.
          </p>
          <div className="space-y-2 rounded-md bg-muted p-3 font-mono text-xs">
            <div>
              <span className="text-muted-foreground">Your address: </span>
              <span className="break-all">{address || "Not connected"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Owner address: </span>
              <span className="break-all">{owner || "Unknown"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
