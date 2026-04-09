import { NextResponse } from "next/server";

const EC2_BACKEND_URL =
  process.env.BACKEND_API_URL || "http://18.214.205.25";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); 

    const backendRes = await fetch(
      `${EC2_BACKEND_URL}/api/v1/stats`,
      {
        method: "GET",
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });

  } catch (error: any) {
    console.error("Backend Proxy Error:", error?.message || error);

    return NextResponse.json(
      {
        error: "Failed to fetch visitor count",
        uniqueVisitors: 0,
        details: error?.message,
      },
      { status: 500 }
    );
  }
}