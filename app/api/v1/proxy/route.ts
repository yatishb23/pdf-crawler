import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const EC2_BACKEND_URL = process.env.BACKEND_API_URL || "http://18.214.205.25";

/**
 * Universal proxy route for backend requests
 * Usage: /api/v1/proxy?endpoint=/path&method=GET&data={...}
 *
 * This allows Vercel (HTTPS) to safely proxy requests to EC2 (HTTP)
 * Solves: blocked:mixed-content errors
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing endpoint parameter" },
      { status: 400 },
    );
  }

  try {
    const targetUrl = `${EC2_BACKEND_URL}${endpoint}`;
    console.log(targetUrl);

    // Forward query parameters
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    const response = await axios.get(finalUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent": "PDF-Crawler-Proxy/1.0",
      },
      validateStatus: () => true, // Accept all status codes
    });

    // Forward response with appropriate headers
    const contentType = response.headers["content-type"] || "application/json";
    const responseHeaders = new Headers({
      "Content-Type": contentType,
    });

    return new NextResponse(Buffer.from(response.data), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Backend proxy error:", error.message);
    return NextResponse.json(
      { error: "Failed to proxy request to backend", details: error.message },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json(
      { error: "Missing endpoint parameter" },
      { status: 400 },
    );
  }

  try {
    const targetUrl = `${EC2_BACKEND_URL}${endpoint}`;
    const body = await request.json().catch(() => ({}));
    console.log(targetUrl);

    const response = await axios.post(targetUrl, body, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent": "PDF-Crawler-Proxy/1.0",
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    const contentType = response.headers["content-type"] || "application/json";
    const responseHeaders = new Headers({
      "Content-Type": contentType,
    });

    return new NextResponse(Buffer.from(response.data), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Backend proxy error:", error.message);
    return NextResponse.json(
      { error: "Failed to proxy request to backend", details: error.message },
      { status: 502 },
    );
  }
}
