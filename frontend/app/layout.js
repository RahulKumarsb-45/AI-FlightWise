import { Plus_Jakarta_Sans } from 'next/font/google';
import { QueryProvider } from '@/lib/QueryProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(SITE_URL),

  applicationName: 'AI FlightWise',

  title: {
    default: 'AI FlightWise — Smarter Flights. Better Decisions.',
    template: '%s · AI FlightWise',
  },

  description:
    'Smarter flights. Better decisions. AI-powered flight decision platform with transparent recommendations, tradeoff analysis, and multi-city route optimization.',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI FlightWise',
  },

  openGraph: {
    title:
      'AI FlightWise — Smarter Flights. Better Decisions.',

    description:
      'Nearby-airport search, flexible dates, and multi-city flight decision intelligence.',

    url: SITE_URL,

    siteName: 'AI FlightWise',

    locale: 'en_IN',

    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',

    title:
      'AI FlightWise — Smarter Flights. Better Decisions.',

    description:
      'Nearby-airport search, flexible dates, and multi-city flight decision intelligence.',
  },
};

// Next.js App Router viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2457D6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans bg-[#F8FAFC] text-ink-900 antialiased min-h-screen flex flex-col">
        <PWAProvider />

        <GoogleAnalytics />

        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}