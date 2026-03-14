"use client";

import { useEffect, useMemo, useState } from "react";

type HackathonCountdownProps = {
  targetIso: string;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function HackathonCountdown({ targetIso }: HackathonCountdownProps) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [remainingMs, setRemainingMs] = useState(() => target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingMs(target - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  if (remainingMs <= 0) {
    return <span className="text-amber-300">Hackathon started</span>;
  }

  return <span>{formatDuration(remainingMs)}</span>;
}
