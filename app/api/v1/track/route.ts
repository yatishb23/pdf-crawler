import { NextResponse } from "next/server";
import axios from "axios";

const EC2_BACKEND_URL =
  process.env.BACKEND_API_URL || "http://18.214.205.25";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";

    const res = await axios.get(`${EC2_BACKEND_URL}/api/v1/track`, {
      headers: {
        cookie: cookieHeader,
      },
      withCredentials: true,
      validateStatus: () => true, // ✅ prevent axios throw
    });

    const response = NextResponse.json(res.data, {
      status: res.status,
    });

    // ✅ forward cookies from backend
    const setCookie = res.headers["set-cookie"];
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((c: string) =>
          response.headers.append("set-cookie", c)
        );
      } else {
        response.headers.set("set-cookie", setCookie);
      }
    }

    return response;
  } catch (error: any) {
    console.error("Backend Proxy Error:", error?.message || error);

    return NextResponse.json(
      { newVisitor: false, count: 0, details: error?.message },
      { status: 500 }
    );
  }
}