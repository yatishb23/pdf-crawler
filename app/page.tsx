import { Metadata } from 'next'
import HomeContent from '@/components/HomeContent'

export const metadata: Metadata = {
  title: 'bookcrawler.io - Read Any Book',
  description: 'Transform thousands of pages into instant knowledge with our intelligent PDF crawler. Read, understand, and extract exactly what you need from any PDF or book.',
  keywords: [
    'PDF crawler',
    'PDF reader',
    'book reader',
    'PDF extractor',
    'document parser',
    'AI PDF reader',
    'PDF knowledge extraction',
    'intelligent PDF reader',
    'PDF text extraction',
    'online PDF tool'
  ],
  authors: [{ name: 'Yatish Badgujar' }],
  creator: 'Yatish Badgujar',
  publisher: 'Yatish Badgujar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'bookcrawler.io - Read Any Book',
    description: 'Transform thousands of pages into instant knowledge. Our intelligent crawler reads, understands, and extracts exactly what you need.',
    url: '/',
    siteName: 'bookcrawler.io',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'bookcrawler.io - AI-Powered Book Reading Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'bookcrawler.io - Read Any Book',
    description: 'Transform thousands of pages into instant knowledge with our intelligent book crawler.',
    images: ['/og-image.png'],
    creator: '@bookcrawler',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function Home() {
  // Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'bookcrawler.io',
    description: 'Transform thousands of pages into instant knowledge with our intelligent book crawler',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    featureList: [
      'Book Reading',
      'Text Extraction',
      'Book Parsing',
      'Knowledge Extraction',
      'Document Analysis',
    ],
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent />
    </>
  )
}
