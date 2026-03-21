# Backend Proxy Setup - Mixed Content Solution

## Problem
Vercel (HTTPS) → EC2 (HTTP) creates **blocked:mixed-content** errors in the browser.

## Solution
**Vercel (HTTPS) → Vercel API (HTTPS) → EC2 (HTTP)**

The proxy routes run on Vercel and can safely call your HTTP EC2 backend server-side.

---

## Configuration

### Environment Variables
```env
# Server-side only (used by API routes)
BACKEND_API_URL=http://13.61.24.161

# Frontend uses relative paths through the proxy
NEXT_PUBLIC_BACKEND_URL=/api/v1/proxy
```

---

## Frontend Usage

### Option 1: Using the `backendProxy` Utility (Recommended)

**File:** `lib/backendProxy.ts`

```typescript
import { backendProxy } from '@/lib/backendProxy';

// GET request
const books = await backendProxy.get('/search', { q: 'JavaScript' });

// POST request
const result = await backendProxy.post('/submit', { title: 'My Book' });

// PUT request
const updated = await backendProxy.put('/update/1', { status: 'active' });

// DELETE request
await backendProxy.delete('/remove/1');
```

### Option 2: Using the Generic Proxy Endpoint

```typescript
// Simple GET
const response = await fetch('/api/v1/proxy?endpoint=/api/books');
const data = await response.json();

// GET with query parameters
const response = await fetch('/api/v1/proxy?endpoint=/search&q=JavaScript');

// POST with data
const response = await fetch('/api/v1/proxy?endpoint=/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Book Title' }),
});
const data = await response.json();
```

---

## Migration Examples

### Before (Direct EC2 Call - ❌ Causes Mixed Content)
```typescript
// components/Dashboard.tsx
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // http://13.61.24.161

useEffect(() => {
  fetch(`${backendUrl}/api/stats`)
    .then(r => r.json())
    .then(setStats)
    .catch(console.error);
}, []);
```

### After (Using Proxy - ✅ Works)
```typescript
// components/Dashboard.tsx
import { backendProxy } from '@/lib/backendProxy';

useEffect(() => {
  backendProxy.get('/api/stats')
    .then(setStats)
    .catch(console.error);
}, []);
```

---

## Available Proxy Routes

### Generic Proxy
- **Endpoint:** `/api/v1/proxy`
- **Purpose:** Forwards any request to EC2 backend
- **Usage:** 
  - `GET /api/v1/proxy?endpoint=/api/books`
  - `POST /api/v1/proxy?endpoint=/api/submit`

### Specific Proxies (Optional - for advanced routing)
- **PDF Proxy:** `/api/v1/proxyPdf?url={url}`
  - For proxying PDF downloads

---

## Backend API Examples

If your EC2 backend serves:
- `http://13.61.24.161/api/books` → Call via `/api/v1/proxy?endpoint=/api/books`
- `http://13.61.24.161/search?q=test` → Call via `/api/v1/proxy?endpoint=/search&q=test`
- `http://13.61.24.161/api/submit` (POST) → Use proxy POST method

---

## Error Handling

All proxy requests return:
- **Success:** `{ ...data }`
- **Error:** `{ error: "message", details: "..." }`

```typescript
try {
  const data = await backendProxy.get('/api/books');
  console.log(data);
} catch (error) {
  console.error('Backend error:', error.message);
  // Handle gracefully (show fallback UI, retry, etc.)
}
```

---

## Performance Considerations

1. **Caching**: Use Redis for frequently accessed data
2. **Timeouts**: Proxy has 30s timeout per request
3. **Direct Calls**: For Vercel-internal operations (within API routes), direct EC2 calls are faster

---

## Security Notes

✅ **Safe:**
- Proxy runs server-side → can handle sensitive operations
- EC2 origin hidden from browser
- HTTPS encryption for Vercel requests

⚠️ **Best Practices:**
- Don't store EC2 URL in `NEXT_PUBLIC_*` variables
- Validate/sanitize endpoint parameters in production
- Consider rate limiting if needed
- Add authentication if EC2 requires it

---

## Troubleshooting

### Still seeing "Blocked: mixed-content" error?
1. Check that frontend components call `/api/v1/proxy` not directly to EC2
2. Verify `BACKEND_API_URL` is set correctly
3. Check browser console for actual failing requests

### 502 Bad Gateway from proxy?
1. Verify EC2 is running and reachable
2. Check network security groups allow outbound to EC2
3. Check proxy logs in Vercel dashboard

### Timeout errors?
1. Increase timeout in proxy route if needed
2. Check EC2 backend response times
3. Optimize heavy operations on EC2 side
