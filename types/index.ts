// src/types/index.ts

// Book related types
export interface BookInfo {
  url: string;
  title: string | null;
  author?: string | null;
  format: string;
  fileSize?: number | null;
  thumbnail?: string | null;
  description?: string | null;
  isbn?: string | null;
  source?: string;
  foundDate?: string;
  relevance?: number;
  trusted?: boolean;
  directLink?: boolean;
}

export interface SearchResult extends BookInfo {
  id?: string;
  score?: number;
}

export interface SearchQuery {
  query: string;
  formats: string[];
  page?: number;
  limit?: number;
}

// File format types
export type FileFormat = 'pdf' | 'epub' | 'mobi' | 'djvu' | 'txt' | 'unknown';

export interface FileTypeInfo {
  extension: string;
  mimeType: string;
}

// Rate limiter types
export interface RateLimiterOptions {
  requestsPerSecond: number;
  maxConcurrent: number;
  domainLimits?: Record<string, number>;
}

export interface DomainQueue {
  queue: QueuedTask[];
  lastRequestTime: number;
  requestsThisSecond: number;
  currentSecond: number;
}

export interface QueuedTask {
  task: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

// Cache types
export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  keys: number;
  hitRate: number;
}

// Crawler types
export interface CrawlerOptions {
  requestsPerSecond?: number;
  maxConcurrent?: number;
  cacheTTL?: number;
  userAgent?: string;
}

export interface RobotsInfo {
  isAllowed: (url: string, userAgent: string) => boolean;
}

// Component props types
export interface SearchBarProps {
  onSearch: (query: string, formats: string[]) => Promise<void>;
}

export interface ResultsListProps {
  results: SearchResult[];
  loading: boolean;
}

export interface BookCardProps {
  book: SearchResult;
}

export interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  error?: string | null;
}

// API response types
export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  count: number;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

// Search engine types
export type SearchEngine = 'google.com' | 'bing.com' | 'duckduckgo.com' | 'yahoo.com';
export type TrustedSource = 'gutenberg.org' | 'openlibrary.org' | 'archive.org';

// Utility types
export interface SelectOption {
  value: string;
  label: string;
}