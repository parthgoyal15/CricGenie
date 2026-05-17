"use client";

import { useEffect } from "react";
import { recordMatchVisit } from "@/lib/user-stats";

export default function VisitTracker({ matchId }: { matchId: string }) {
  useEffect(() => {
    recordMatchVisit(matchId);
  }, [matchId]);
  return null;
}
