import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Layout from '@/components/Layout';

const siteUrl = new URL('https://provn.live');

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'Provn | The Student-to-Career Tech Platform',
    template: '%s | Provn',
  },
  description: 'Provn is the premier technical career readiness platform. We bridge the gap between campus learning and tech industry hiring. Master coding roadmaps, build real-world developer skills, and get hired directly by tech companies on Provn.',
  keywords: ['Provn', 'provn.live', 'tech career readiness', 'software engineering roadmaps', 'campus to careers', 'developer internships', 'tech jobs', 'coding skills', 'developer portfolio', 'tech hiring platform', 'provn platform'],
  openGraph: {
    title: 'Provn | The Student-to-Career Tech Platform',
    description: 'Master coding roadmaps, build real-world developer skills, and get hired directly by top tech companies on Provn.',
    type: 'website',
    url: siteUrl,
    siteName: 'Provn',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Provn | Tech Campus to Careers',
    description: 'Master coding roadmaps, build real-world developer skills, and get hired on Provn.',
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
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
