# Backend Data Collection & Display Guide

## Overview

Your backend API sends rich book data with many fields. This guide shows how to properly collect and beautifully display all that data on the frontend.

---

## Backend Data Structure

### BookResult (from `/api/v1/getBooks`)
```typescript
{
  title: string;           // Book title
  url: string;             // PDF download link
  source: string;          // "Google" | "Brave" | "DuckDuckGo"
  type: string;            // "PDF"
  author?: string;         // Author name
  year?: number;           // Publication year
  fileSize?: number;       // File size in bytes
  relevanceScore: number;  // 0.0 - 1.0 (how relevant to search)
}
```

### SavedBook (from `/api/v1/books/saved`)
```typescript
{
  url: string;             // Original PDF URL
  title: string;           // Book title
  author?: string;         // Author
  year?: number;           // Publication year
  savedAt: string;         // ISO datetime when saved
  notes?: string;          // User notes
}
```

### Visitor Stats (from `/api/v1/stats`)
```typescript
{
  uniqueVisitors: number;  // Total unique visitors
}
```

---

## Frontend Improvements

### 1. **Updated Type Definitions** (`types/index.ts`)

Now properly typed with:
- ✅ Backend API response types
- ✅ Display/UI component types
- ✅ Full type safety

```typescript
// Correct types for backend responses
import type { BookResult, SavedBook, StatsResponse } from '@/types/index';
```

### 2. **Data Fetching Hooks** (`lib/useBackend.ts`)

Four purpose-built hooks for backend interaction:

#### `useSearchBooks()`
```typescript
const { data, isLoading, error, search } = useSearchBooks();

// Search with automatic validation & caching
await search("JavaScript");
// Returns: BookResult[] with all fields
```

**Features:**
- ✅ Automatic data validation
- ✅ Type-safe responses
- ✅ Built-in caching (5 min default)
- ✅ Error handling & logging
- ✅ Filters out malformed items

#### `useSavedBooks()`
```typescript
const { data, save, remove, fetch } = useSavedBooks();

// Save a book
await save(bookResult);

// Remove a book
await remove(book.url);

// Fetch all saved books (auto on mount)
await fetch();
```

**Features:**
- ✅ Auto-refresh after save/remove
- ✅ Type-safe SavedBook[] data
- ✅ Error recovery

#### `useVisitorStats()`
```typescript
const { count, isLoading, error, refetch } = useVisitorStats();

// Returns unique visitor count, auto-refreshes every 30s
```

#### `useVisitorTracking()`
```typescript
const { isTracking, error, track } = useVisitorTracking();

// Track current visitor on mount
```

### 3. **Enhanced PDFCard Component** (`components/PDFCardNew.tsx`)

Now displays all book data beautifully:

```typescript
<PDFCardNew 
  book={bookResult}           // Full BookResult with all fields
  onSave={handleSaveBook}     // Save callback
  isSaved={isSavedAlready}    // Show saved indicator
/>
```

**Displays:**
- ✅ Thumbnail preview
- ✅ Title & author
- ✅ Publication year
- ✅ File size (formatted: 1.5 MB)
- ✅ Source badge (Google/Brave/DuckDuckGo)
- ✅ Relevance score (Highly Relevant, Relevant, Moderate)
- ✅ Save/Download buttons
- ✅ Responsive design

### 4. **New Dashboard Component** (`components/DashboardNew.tsx`)

Completely redesigned with:

**Features:**
- ✅ Real-time search with validation
- ✅ Results counter
- ✅ Error display with helpful messages
- ✅ Loading states
- ✅ Empty state handling
- ✅ Saved books section
- ✅ Quick save/remove actions
- ✅ Beautiful animations

**Usage:**
```typescript
import DashboardNew from '@/components/DashboardNew';

export default function Page() {
  return <DashboardNew />;
}
```

---

## How to Use

### Step 1: Update Your App Layout

Replace old components with new ones in `app/dashboard/page.tsx`:

**Before:**
```typescript
import Dashboard from '@/components/Dashboard';

export default function Page() {
  return <Dashboard />;
}
```

**After:**
```typescript
import DashboardNew from '@/components/DashboardNew';

export default function Page() {
  return <DashboardNew />;
}
```

### Step 2: Use Hooks in Custom Components

For any custom component that needs backend data:

```typescript
"use client";

import { useSearchBooks, useSavedBooks } from '@/lib/useBackend';
import type { BookResult } from '@/types/index';

export default function MyComponent() {
  const { data: books, search, isLoading } = useSearchBooks();
  const { data: savedBooks } = useSavedBooks();

  const handleSearch = async (query: string) => {
    const results = await search(query);
    // results is BookResult[] with all fields
    console.log(results[0].author, results[0].fileSize, results[0].relevanceScore);
  };

  return (
    // Your JSX using books, savedBooks, etc.
  );
}
```

### Step 3: Display Data With Proper Types

All data is properly typed:

```typescript
// ✅ Type-safe access to all fields
book.title          // string
book.author         // string | undefined
book.fileSize       // number | undefined
book.relevanceScore // number
book.source         // "Google" | "Brave" | "DuckDuckGo"
book.year          // number | undefined

// ✅ No type errors when accessing nested data
if (book.author) {
  console.log(book.author.toUpperCase()); // ✅ Safe
}
```

---

## Data Flow Diagram

```
Frontend Search Input
    ↓
useSearchBooks() hook
    ↓ (validates & caches)
Proxy (/api/v1/proxy/api/v1/getBooks)
    ↓
EC2 Backend (/api/v1/getBooks)
    ↓ (returns BookResult[])
PDFCardNew component
    ↓
Beautiful display with:
  - Thumbnail
  - All metadata (author, year, size)
  - Source badge
  - Relevance indicator
  - Save/Download buttons
```

---

## API Endpoints Used

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `GET /api/v1/getBooks?q=` | Search books | `BookResult[]` |
| `GET /api/v1/stats` | Get visitor count | `{ uniqueVisitors: number }` |
| `GET /api/v1/track` | Track visitor | `{ newVisitor: boolean, count: number }` |
| `POST /api/v1/books/save` | Save a book | `{ status: "saved" \| "error" }` |
| `GET /api/v1/books/saved` | Get saved books | `SavedBook[]` |
| `DELETE /api/v1/books/saved?url=` | Remove saved book | `{ status: "deleted" \| "error" }` |

All routed through proxy: `/api/v1/proxy/[...path]`

---

## Error Handling

All hooks provide error states:

```typescript
const { data, error, isLoading } = useSearchBooks();

if (error) {
  console.error('Search failed:', error);
  // Show user-friendly message
}
```

The DashboardNew component automatically displays:
- Error messages with helpful guidance
- Loading spinners
- Empty states
- Retry options via search

---

## Performance Features

✅ **Caching**: Search results cached for 5 minutes
✅ **Lazy Loading**: PDFCardNew thumbnails lazy-load on scroll
✅ **Image Optimization**: Thumbnails rendered at appropriate quality
✅ **Type Safety**: TypeScript catches data issues at compile time
✅ **Validation**: Backend responses validated before use

---

## Browser Compatibility

✅ Modern browsers (Chrome, Firefox, Safari, Edge)
✅ Mobile responsive
✅ Works with mixed-content proxy (HTTPS frontend → HTTP backend)

---

## Next Steps

1. ✅ Types updated (`types/index.ts`)
2. ✅ Hooks created (`lib/useBackend.ts`)
3. ✅ New components created (`components/PDFCardNew.tsx`, `components/DashboardNew.tsx`)
4. 🔜 Update `app/dashboard/page.tsx` to use `DashboardNew`
5. 🔜 Optional: Update other components using the new hooks

---

## File Summary

| File | Purpose |
|------|---------|
| `types/index.ts` | ✅ Type definitions for all API responses |
| `lib/useBackend.ts` | ✅ Data fetching hooks with validation |
| `lib/backendProxy.ts` | Existing proxy utility (still works) |
| `components/PDFCardNew.tsx` | ✅ Enhanced card showing full book data |
| `components/DashboardNew.tsx` | ✅ Redesigned dashboard with search |
| `app/api/v1/proxy/[...path]/route.ts` | Existing catch-all proxy route |

---

## Troubleshooting

### Data not loading?
1. Check browser console for error messages
2. Verify EC2 backend is running
3. Check network tab - is proxy request going to `/api/v1/proxy/...`?

### Books not showing metadata?
1. Check backend returns all fields
2. Use React DevTools to inspect component props
3. Console logs show validation errors

### Types showing errors?
1. Run `npm run build` to see full type errors
2. Ensure `types/index.ts` is imported correctly
3. Check `lib/useBackend.ts` exports are correct

---

## Customization

### Change cache duration:
```typescript
const { data } = useSearchBooks({ 
  enableCache: true, 
  cacheExpiry: 1000 * 60 * 10 // 10 minutes
});
```

### Disable caching:
```typescript
const { data } = useSearchBooks({ enableCache: false });
```

### Custom PDFCard styling:
Fork `PDFCardNew.tsx` and modify Tailwind classes

### Custom dashboard layout:
Create new layout in `DashboardNew.tsx` but keep the hooks

---

## Summary

You now have:
- ✅ Proper TypeScript types for all backend responses
- ✅ Reusable data fetching hooks with validation
- ✅ Beautiful components that display all available data
- ✅ Proper error handling and loading states
- ✅ Type-safe data access throughout your app
- ✅ Caching and performance optimization

All backend data is now properly collected, validated, and displayed! 🎉
