"use client";

import React, { useEffect } from "react";

type TransactionStatus = "default" | "success" | "error" | "pending";

interface ProcessingMirrorProps {
  status: TransactionStatus;
  onChange: (pending: boolean) => void;
}

export const ProcessingMirror = React.memo(function ProcessingMirror({
  status,
  onChange,
}: ProcessingMirrorProps) {
  useEffect(() => {
    onChange(status === "pending");
  }, [status, onChange]);
  return null;
});
