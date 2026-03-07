import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const KEY = "unique_visitors_crawler";

export async function GET() {
  try {
    const client = await redis(); // ✅ get redis client

    const count = await client.sCard(KEY);

    return NextResponse.json({
      uniqueVisitors: count,
    });
  } catch (error) {
    console.error("Redis Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch visitor count" },
      { status: 500 }
    );
  }
}