import { NextRequest, NextResponse } from "next/server";
import { searchBook,BookResult } from "@/lib/crawler";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookName = searchParams.get("q");

    if (!bookName) {
      return NextResponse.json(
        { error: "Book name query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const results: BookResult[] = await searchBook(bookName);

    if (results.length === 0) {
      return NextResponse.json(
        { message: "No books found" },
        { status: 404 }
      );
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}