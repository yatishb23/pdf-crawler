import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const EC2_BACKEND_URL = process.env.BACKEND_API_URL || "http://13.61.24.161";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await fetch(`${EC2_BACKEND_URL}/api/v1/track`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Backend response not ok");

    const data = await res.json();
    const response = NextResponse.json(data);

    // Forward any cookies set by the backend
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error) {
    console.error("Backend Proxy Error:", error);

    return NextResponse.json({ newVisitor: false, count: 0 }, { status: 500 });
  }
}
