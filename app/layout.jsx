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
  title: 'Provn — Campus to Careers',
  description: 'The career readiness platform that bridges the gap between campus learning and industry hiring. Build real skills, complete projects, get hired.',
  keywords: ['career readiness', 'campus to careers', 'internships', 'jobs', 'skills', 'portfolio'],
  openGraph: {
    title: 'Provn — Campus to Careers',
    description: 'Build real skills. Complete projects. Get hired.',
    type: 'website',
    url: siteUrl,
  },
  twitter: {
    card: 'summary',
    title: 'Provn — Campus to Careers',
    description: 'Build real skills. Complete projects. Get hired.',
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
