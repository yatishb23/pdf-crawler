import { NextResponse } from "next/server";

const EC2_BACKEND_URL = process.env.BACKEND_API_URL || "http://13.61.24.161";

export async function GET() {
  try {
    const res = await fetch(`${EC2_BACKEND_URL}/api/v1/stats`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Backend response not ok");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Backend Proxy Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch visitor count", uniqueVisitors: 0 },
      { status: 500 },
    );
  }
}
