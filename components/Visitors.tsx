"use client";

import { useEffect } from "react";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") || "http://localhost:8000";

export default function Visitors() {
  useEffect(() => {
    fetch(`${BACKEND_BASE_URL}/api/v1/track`, {
      credentials: "include",
    });
  }, []);

  return null;
}
