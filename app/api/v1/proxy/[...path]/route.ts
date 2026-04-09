import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const EC2_BACKEND_URL = process.env.BACKEND_API_URL || "http://18.214.205.25";

/**
 * Catch-all proxy route for backend requests
 * Handles both patterns:
 * 1. /api/v1/proxy?endpoint=/path (query parameter)
 * 2. /api/v1/proxy/path (path parameter - for backward compatibility)
 *
 * This allows Vercel (HTTPS) to safely proxy requests to EC2 (HTTP)
 * Solves: blocked:mixed-content errors
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const { searchParams } = new URL(request.url);

    // Check for query parameter endpoint first
    let endpoint = searchParams.get("endpoint");

    // If no endpoint query param, construct from URL path
    if (!endpoint && path && path.length > 0) {
      endpoint = "/" + path.join("/");
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint parameter or path" },
        { status: 400 },
      );
    }

    const targetUrl = `${EC2_BACKEND_URL}${endpoint}`;

    const params_copy = new URLSearchParams(searchParams);
    params_copy.delete("endpoint");
    const queryString = params_copy.toString();
    const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

    console.log(`[PROXY] GET ${endpoint} → ${finalUrl}`);

    const response = await axios.get(finalUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent": "PDF-Crawler-Proxy/1.0",
      },
      validateStatus: () => true,
    });

    const contentType = response.headers["content-type"] || "application/json";
    const responseHeaders = new Headers({
      "Content-Type": contentType,
    });

    const payload = Buffer.from(response.data);

    return new NextResponse(payload, {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const { searchParams } = new URL(request.url);

    // Check for query parameter endpoint first
    let endpoint = searchParams.get("endpoint");

    // If no endpoint query param, construct from URL path
    if (!endpoint && path && path.length > 0) {
      endpoint = "/" + path.join("/");
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: "Missing endpoint parameter or path" },
        { status: 400 },
      );
    }

    const targetUrl = `${EC2_BACKEND_URL}${endpoint}`;
    const body = await request.json().catch(() => ({}));

    console.log(`[PROXY] POST ${endpoint} → ${targetUrl}`);

    const response = await axios.post(targetUrl, body, {
      timeout: 30000,
      headers: {
        "User-Agent": "PDF-Crawler-Proxy/1.0",
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });
    console.log(response.data);

    const responseHeaders = new Headers({
      "Content-Type": response.headers["content-type"] || "application/json",
    });

    // Serialize response data as JSON string
    const responseBody =
      typeof response.data === "string"
        ? response.data
        : JSON.stringify(response.data);

    return new NextResponse(responseBody, {
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
