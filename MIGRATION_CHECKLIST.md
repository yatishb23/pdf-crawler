# Migration Checklist: Direct EC2 → Backend Proxy

This checklist helps you systematically migrate from direct EC2 calls to the backend proxy.

## Phase 1: Setup ✅

- [x] Created `/api/v1/proxy/route.ts` - generic proxy handler
- [x] Created `/lib/backendProxy.ts` - client utility
- [x] Updated `.env.local` with proper configuration
- [x] Updated `next.config.ts` with headers
- [x] Created documentation in `PROXY_SETUP.md`

## Phase 2: Frontend Components

Identify and update all components that make backend calls:

### Components to Check:

- [ ] **Dashboard.tsx** - Check for EC2 calls
- [ ] **HomeContent.tsx** - Check for EC2 calls
- [ ] **PDFCard.tsx** - Check for EC2 calls  
- [ ] **VisitorTrack.tsx** - Check for EC2 calls
- [ ] **Visitors.tsx** - Check for EC2 calls
- [ ] **Any other components** - Grep for `NEXT_PUBLIC_BACKEND_URL` or `13.61.24.161`

### Search Command:
```bash
grep -r "NEXT_PUBLIC_BACKEND_URL\|13.61.24.161" app/ components/ --include="*.tsx" --include="*.ts"
```

## Phase 3: Update Each Component

### Template for Migration:

**Before:**
```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

useEffect(() => {
  fetch(`${backendUrl}/api/endpoint`)
    .then(r => r.json())
    .then(setData)
    .catch(console.error);
}, []);
```

**After:**
```typescript
import { backendProxy } from '@/lib/backendProxy';

useEffect(() => {
  backendProxy.get('/api/endpoint')
    .then(setData)
    .catch(console.error);
}, []);
```

## Phase 4: Testing

- [ ] Test each updated component in development
- [ ] Verify network requests in browser DevTools
- [ ] Check that requests go to `/api/v1/proxy` (not directly to EC2)
- [ ] Verify no "blocked:mixed-content" errors in console
- [ ] Test error handling scenarios

## Phase 5: Deployment

- [ ] Update environment variables on Vercel:
  - Remove `NEXT_PUBLIC_BACKEND_URL=http://13.61.24.161`
  - Add `BACKEND_API_URL=http://13.61.24.161` (if not in `.env.local`)
- [ ] Deploy to Vercel
- [ ] Monitor error logs
- [ ] Verify all endpoints work

## Vercel Environment Setup

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   ```
   BACKEND_API_URL=http://13.61.24.161
   ```
   - Select "Production", "Preview", and "Development"
3. Redeploy

---

## Common Patterns

### Pattern 1: Simple GET in useEffect
```typescript
// Before
const [data, setData] = useState(null);
useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/books`)
    .then(r => r.json())
    .then(setData);
}, []);

// After
import { backendProxy } from '@/lib/backendProxy';

const [data, setData] = useState(null);
useEffect(() => {
  backendProxy.get('/api/books').then(setData);
}, []);
```

### Pattern 2: GET with Query Parameters
```typescript
// Before
const params = new URLSearchParams({ q: 'javascript' });
fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search?${params}`)

// After
backendProxy.get('/search', { q: 'javascript' })
```

### Pattern 3: POST with Data
```typescript
// Before
fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/submit`, {
  method: 'POST',
  body: JSON.stringify({ title: 'Book' })
})

// After
backendProxy.post('/api/submit', { title: 'Book' })
```

### Pattern 4: Event Handler
```typescript
// Before
const handleClick = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/action`, {
    method: 'POST',
    body: JSON.stringify({ id: itemId })
  });
  const result = await response.json();
  setResult(result);
};

// After
import { backendProxy } from '@/lib/backendProxy';

const handleClick = async () => {
  try {
    const result = await backendProxy.post('/api/action', { id: itemId });
    setResult(result);
  } catch (error) {
    console.error('Action failed:', error);
    // Show error to user
  }
};
```

---

## Files Modified/Created

✅ Created:
- `/app/api/v1/proxy/route.ts` - Universal proxy
- `/lib/backendProxy.ts` - Client utility
- `/PROXY_SETUP.md` - Setup guide
- `/MIGRATION_CHECKLIST.md` - This file

✅ Updated:
- `/.env.local` - Environment variables
- `/next.config.ts` - Headers configuration

---

## Quick Reference

| Operation | Before | After |
|-----------|--------|-------|
| GET | `fetch(backendUrl + '/api/...')` | `backendProxy.get('/api/...')` |
| POST | `fetch(..., { method: 'POST', body: ... })` | `backendProxy.post('/api/...', data)` |
| Query Params | `?q=value` | `backendProxy.get('/path', { q: 'value' })` |
| Error Handling | `.catch()` | `try/catch` with backendProxy |

---

## Support

If you encounter issues:

1. Check `PROXY_SETUP.md` Troubleshooting section
2. Verify EC2 instance is running
3. Check Vercel deployment logs
4. Test proxy directly: `/api/v1/proxy?endpoint=/api/test`
