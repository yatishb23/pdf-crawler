import json
import uuid

import httpx
import redis.exceptions
from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.crawler import search_book
from app.services.pdf_service import fetch_pdf_bytes, first_page_preview_jpeg
from app.services.redis_client import get_redis

CACHE_EXPIRATION = 60 * 60 * 24
VISITOR_KEY = "unique_visitors_crawler"

app = FastAPI(title="PDF Crawler Backend", version="1.0.0")

allowed_origins = [settings.frontend_origin, "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/getBooks")
async def get_books(q: str | None = Query(default=None)):
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="Book name query parameter 'q' is required")

    book_name = q.strip()
    cache_key = f"search:{':'.join(book_name.lower().split())}"

    client = await get_redis()

    try:
        cached = await client.get(cache_key)
        if cached:
            return json.loads(cached)
    except redis.exceptions.RedisError as exc:
        print(f"[redis] Cache get error: {exc}")

    results = await search_book(book_name)

    if not results:
        raise HTTPException(status_code=404, detail="No books found")

    try:
        await client.set(cache_key, json.dumps([r.model_dump() for r in results]), ex=CACHE_EXPIRATION)
    except redis.exceptions.RedisError as exc:
        print(f"[redis] Cache set error: {exc}")

    return [r.model_dump() for r in results]


@app.get("/api/v1/proxyPdf")
async def proxy_pdf(url: str | None = Query(default=None)):
    if not url:
        raise HTTPException(status_code=400, detail="Missing URL parameter")

    try:
        data, content_type = await fetch_pdf_bytes(url)
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Content-Disposition": "inline",
            "Cache-Control": "public, max-age=3600",
        }
        return Response(content=data, media_type=content_type, headers=headers)
    except ValueError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except httpx.HTTPStatusError as exc:  # type: ignore[name-defined]
        status = exc.response.status_code if exc.response is not None else 502
        raise HTTPException(status_code=status, detail=f"Failed to fetch PDF: {exc}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch PDF: {exc}") from exc


@app.get("/api/v1/preview")
async def preview_pdf(url: str | None = Query(default=None)):
    if not url:
        raise HTTPException(status_code=400, detail="Missing URL parameter")

    client = await get_redis()
    cache_key = f"preview:{url}"
    
    try:
        # Check cache first
        cached_preview = await client.get(cache_key)
        if cached_preview:
            return Response(
                content=cached_preview,
                media_type="image/jpeg",
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "public, max-age=3600",
                    "X-Cache": "hit",
                },
            )
    except redis.exceptions.RedisError:
        pass

    try:
        pdf_bytes, _ = await fetch_pdf_bytes(url)
        preview = first_page_preview_jpeg(pdf_bytes, scale=0.5, quality=55)

        # Cache preview for 24h
        try:
            await client.set(cache_key, preview, ex=60*60*24)
        except redis.exceptions.RedisError:
            pass

        return Response(
            content=preview,
            media_type="image/jpeg",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600",
                "X-Cache": "miss",
            },
        )
    except ValueError as exc:
        raise HTTPException(status_code=415, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to render preview: {exc}") from exc


@app.get("/api/v1/track")
async def track_visitor(request: Request, response: Response):
    client = await get_redis()
    visitor_id = request.cookies.get("visitorId")

    if not visitor_id:
        visitor_id = str(uuid.uuid4())
        await client.sadd(VISITOR_KEY, visitor_id)
        response.set_cookie(
            key="visitorId",
            value=visitor_id,
            httponly=True,
            max_age=60 * 60 * 24 * 365,
            path="/",
            samesite="lax",
        )
        count = await client.scard(VISITOR_KEY)
        return {"newVisitor": True, "count": count}

    count = await client.scard(VISITOR_KEY)
    return {"newVisitor": False, "count": count}


@app.get("/api/v1/stats")
async def stats():
    client = await get_redis()
    try:
        count = await client.scard(VISITOR_KEY)
        return {"uniqueVisitors": count}
    except redis.exceptions.RedisError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch visitor count: {exc}") from exc
