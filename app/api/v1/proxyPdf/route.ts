import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/pdf, application/octet-stream, */*',
        'Referer': new URL(url).origin,
        'Connection': 'keep-alive'
      },
      // Some servers might block requests without common browser headers
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });

    const contentType = response.headers['content-type'] || 'application/pdf';
    
    // Validate that the response is actually a PDF or at least not HTML
    const isHtml = contentType.toLowerCase().includes('text/html');
    if (isHtml) {
      // Check if it's a very large response (likely a PDF mislabeled as HTML) 
      // or if it has the PDF header despite the content-type.
      const data = Buffer.from(response.data);
      const isPdfHeader = data.slice(0, 4).toString() === '%PDF';
      
      if (!isPdfHeader) {
        console.warn('Proxy received HTML instead of PDF for URL:', url);
        return new NextResponse('Link returned a webpage, not a PDF file', { status: 415 });
      }
      console.log('PDF header detected despite text/html content-type for:', url);
    }

    // Additional check for common non-PDF responses
    const data = Buffer.from(response.data);
    const isPdf = data.slice(0, 4).toString() === '%PDF';
    
    if (!isPdf && !contentType.includes('application/octet-stream')) {
       console.warn('Response does not have PDF header for URL:', url);
       // We still try to return it if it's not HTML, as some PDFs are weirdly served
    }
    
    // Return the PDF data with original content type but our own CORS headers
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err: any) {
    const status = err.response?.status || 502;
    const errorMsg = err.response?.data?.toString().slice(0, 100) || err.message;
    console.error(`Proxy error (${status}) for URL:`, url, errorMsg);
    return new NextResponse(`Failed to fetch PDF: ${errorMsg}`, { status });
  }
}
