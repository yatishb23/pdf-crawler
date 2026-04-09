import { NextResponse } from "next/server";
import axios from "axios";

const EC2_BACKEND_URL = process.env.BACKEND_API_URL || "http://18.214.205.25";

export const dynamic = "force-dynamic"; // Ensure it never caches in production

export async function GET() {
  try {
    const res = await axios.get(`${EC2_BACKEND_URL}/api/v1/stats`);

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error("Backend Proxy Error:", error?.message || error);

    return NextResponse.json(
      {
        error: "Failed to fetch visitor count",
        uniqueVisitors: 0,
        details: error?.message,
      },
      { status: 500 },
    );
  }
}
