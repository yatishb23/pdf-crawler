import axios from "axios";
import * as cheerio from "cheerio";

export interface BookResult {
    title: string;
    url: string;
    source: string;
    type: string;
}

const userAgents: string[] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
];

export async function searchBook(bookName: string): Promise<BookResult[]> {
    const searchEngines = [
        { name: "Brave", url: `https://search.brave.com/search?q=${encodeURIComponent(bookName)}+filetype:pdf` },
        { name: "Google", url: `https://www.google.com/search?q=${encodeURIComponent(bookName)}+filetype:pdf` },
        { name: "DuckDuckGo", url: `https://duckduckgo.com/?q=${encodeURIComponent(bookName)}+filetype:pdf` }
    ];

    let allResults: BookResult[] = [];

    for (const engine of searchEngines) {
        try {
            const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            const { data } = await axios.get<string>(engine.url, {
                headers: {
                    "User-Agent": randomUA,
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5"
                },
                timeout: 10000
            });

            const $ = cheerio.load(data);
            const results = parseResults($, engine.name);
            allResults = [...allResults, ...results];

            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
            console.log(`⚠️ Error searching ${engine.name}: ${error.message}`);
        }
    }

    // Remove duplicates
    return [...new Map(allResults.map(item => [item.url, item])).values()];
}

function parseResults($: cheerio.CheerioAPI, engine: string): BookResult[] {
    const results: BookResult[] = [];

    switch (engine) {
        case "Brave":
            $('a[href*=".pdf"]').each((_, el) => {
                const link = $(el).attr("href");
                if (link && !link.includes("brave.com")) {
                    const title = $(el).text().trim() || extractTitleFromUrl(link);
                    results.push({ title, url: link, source: "Brave", type: "PDF" });
                }
            });
            break;

        case "Google":
            $("a").each((_, el) => {
                const link = $(el).attr("href");
                if (link && link.includes(".pdf") && link.startsWith("http")) {
                    const title = $(el).text().trim() || extractTitleFromUrl(link);
                    results.push({ title, url: link, source: "Google", type: "PDF" });
                }
            });
            break;
         
        case "DuckDuckGo":
            $('a.result__a').each((_, el) => {
                const link = $(el).attr("href");
                if (link && link.includes(".pdf") && link.startsWith("http")) {
                    const title = $(el).text().trim() || extractTitleFromUrl(link);
                    results.push({ title, url: link, source: "DuckDuckGo", type: "PDF" });
                }
            });
            break;    
    }

    return results;
}

function extractTitleFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        const filename = urlObj.pathname.split("/").pop() || "";
        return filename.replace(".pdf", "").replace(/[_-]/g, " ").trim();
    } catch {
        return "Unknown Title";
    }
}