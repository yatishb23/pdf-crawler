import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redis } from "@/lib/redis";

const KEY = "unique_visitors_crawler";

export async function GET() {
  const cookieStore = await cookies();
  const existing = cookieStore.get("visitorId");

  if (!existing) {
    const id = crypto.randomUUID();

    await redis.sAdd(KEY, id);

    const count = await redis.sCard(KEY);

    const response = NextResponse.json({
      newVisitor: true,
      count,
    });

    response.cookies.set("visitorId", id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365, 
    });

    return response;
  }

  const count = await redis.sCard(KEY);

  return NextResponse.json({
    newVisitor: false,
    count,
  });
}
