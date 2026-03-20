import asyncio
import random
from urllib.parse import quote_plus, urlparse

import httpx
from bs4 import BeautifulSoup

from app.models import BookResult

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

SEARCH_ENGINES = [
    ("Brave", "https://search.brave.com/search?q={q}+filetype:pdf"),
    ("Google", "https://www.google.com/search?q={q}+filetype:pdf"),
    ("DuckDuckGo", "https://duckduckgo.com/?q={q}+filetype:pdf"),
]


def extract_title_from_url(url: str) -> str:
    try:
        path = urlparse(url).path
        filename = path.split("/")[-1] if path else ""
        return filename.replace(".pdf", "").replace("_", " ").replace("-", " ").strip() or "Unknown Title"
    except Exception:
        return "Unknown Title"


def _parse_engine_results(html: str, engine: str) -> list[BookResult]:
    soup = BeautifulSoup(html, "lxml")
    results: list[BookResult] = []

    if engine == "Brave":
        for tag in soup.select('a[href*=".pdf"]'):
            link = tag.get("href")
            if not link or "brave.com" in link:
                continue
            title = tag.get_text(strip=True) or extract_title_from_url(link)
            results.append(BookResult(title=title, url=link, source="Brave"))

    elif engine == "Google":
        for tag in soup.select("a[href]"):
            link = tag.get("href")
            if not link or ".pdf" not in link or not link.startswith("http"):
                continue
            title = tag.get_text(strip=True) or extract_title_from_url(link)
            results.append(BookResult(title=title, url=link, source="Google"))

    elif engine == "DuckDuckGo":
        for tag in soup.select("a.result__a"):
            link = tag.get("href")
            if not link or ".pdf" not in link or not link.startswith("http"):
                continue
            title = tag.get_text(strip=True) or extract_title_from_url(link)
            results.append(BookResult(title=title, url=link, source="DuckDuckGo"))

    return results


async def search_book(book_name: str) -> list[BookResult]:
    timeout = httpx.Timeout(8.0)
    
    async def fetch_engine(client: httpx.AsyncClient, engine: str, template: str) -> list[BookResult]:
        try:
            ua = random.choice(USER_AGENTS)
            url = template.format(q=quote_plus(book_name))
            response = await client.get(
                url,
                headers={
                    "User-Agent": ua,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                },
            )
            response.raise_for_status()
            return _parse_engine_results(response.text, engine)
        except Exception as exc:
            print(f"[crawler] Error searching {engine}: {exc}")
            return []
    
    async with httpx.AsyncClient(timeout=timeout, follow_redirects=True, limits=httpx.Limits(max_connections=10, max_keepalive_connections=5)) as client:
        tasks = [fetch_engine(client, engine, template) for engine, template in SEARCH_ENGINES]
        results_per_engine = await asyncio.gather(*tasks)
        all_results = [result for results in results_per_engine for result in results]

    dedup_by_url: dict[str, BookResult] = {}
    for item in all_results:
        dedup_by_url[item.url] = item

    return list(dedup_by_url.values())
