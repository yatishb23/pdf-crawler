import { NextResponse } from "next/server";
import axios from "axios";

const EC2_BACKEND_URL = process.env.BACKEND_API_URL || "http://13.61.24.161";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await axios.get(`${EC2_BACKEND_URL}/api/v1/track`, {
      headers: {
        cookie: cookieHeader,
      },
      timeout: 10000,
    });

    const response = NextResponse.json(res.data);

    // Forward any cookies set by the backend
    const setCookie = res.headers["set-cookie"];
    if (setCookie && setCookie.length > 0) {
      // Axios returns set-cookie as an array
      setCookie.forEach((cookieStr: string) => {
        response.headers.append("set-cookie", cookieStr);
      });
    }

    return response;
  } catch (error: any) {
    console.error("Backend Proxy Error:", error?.message || error);

    return NextResponse.json(
      { newVisitor: false, count: 0, details: error?.message },
      { status: 500 },
    );
  }
}
