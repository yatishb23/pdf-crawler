"use client";

import { useEffect, useState } from "react";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000";

export default function VisitorTracker() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/v1/stats`, {
          credentials: "include",
        });
        const data = await res.json();
        setCount(data.uniqueVisitors);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    trackVisitor();
  }, []);

  if (count === null) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs font-medium text-neutral-500">
        {count} unique visitors
      </span>
    </div>
  );
}
