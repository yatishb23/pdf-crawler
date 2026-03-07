import { NextRequest, NextResponse } from "next/server";
import { searchBook, BookResult } from "@/lib/crawler";
import { redis } from "@/lib/redis";

const CACHE_EXPIRATION = 60 * 60 * 24; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let bookName = searchParams.get("q");

    if (!bookName) {
      return NextResponse.json(
        { error: "Book name query parameter 'q' is required" },
        { status: 400 }
      );
    }
    bookName = bookName
      .trim()              
      .replace(/\s+/g, " ")
    const cacheKey = `search:${bookName.toLowerCase()}`;

    try {
      const cachedResults = await redis.get(cacheKey);
      if (cachedResults) {
        return NextResponse.json(JSON.parse(cachedResults as string));
      }
    } catch (cacheError) {
      console.error("Redis Cache Error:", cacheError);
    }

    const results: BookResult[] = await searchBook(bookName);

    if (results.length === 0) {
      return NextResponse.json(
        { message: "No books found" },
        { status: 404 }
      );
    }

    try {
      await redis.set(cacheKey, JSON.stringify(results), {
        EX: CACHE_EXPIRATION,
      });
    } catch (cacheError) {
      console.error("Redis Cache Set Error:", cacheError);
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}