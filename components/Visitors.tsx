"use client";

import { useEffect } from "react";

export default function Visitors() {
  useEffect(() => {
    fetch("/api/v1/track");
  }, []);

  return null;
}
