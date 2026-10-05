import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'AI Describer - Autonomous Shopify Product Descriptions',
  description: 'Autonomous 24/7 Shopify AI Product Description Generator & Billing Engine.',
  openGraph: {
    title: 'AI Describer - Autonomous Shopify Product Descriptions',
    description: 'Autonomous 24/7 Shopify AI Product Description Generator & Billing Engine.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Describer - Autonomous Shopify Product Descriptions',
    description: 'Autonomous 24/7 Shopify AI Product Description Generator & Billing Engine.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
