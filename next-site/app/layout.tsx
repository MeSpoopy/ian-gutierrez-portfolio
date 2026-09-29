import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './motion.css';
export const metadata: Metadata = {
  title: 'Ian Gutierrez — Business complexity. Beautifully connected.',
  description: 'Zoho applications, connected workflows, and thoughtful digital experiences. Explore the work of Ian Van Anthony Gutierrez, solutions developer and technology project manager.',
  metadataBase: new URL('https://mespoopy.github.io/ian-gutierrez-portfolio/'),
  openGraph: { title: 'Ian Gutierrez — Solutions Developer', description: 'Business complexity. Beautifully connected.', images: ['ian-about-portrait.png'], type: 'website' },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '/ian-gutierrez-portfolio';
  return <html lang="en"><head><link rel="stylesheet" href={`${base}/fonts/fonts.css`} /><link rel="preload" as="font" type="font/woff2" crossOrigin="anonymous" href={`${base}/fonts/manrope-latin.woff2`} /><link rel="icon" href={`${base}/favicon.svg`} /><meta name="theme-color" content="#0b100f" /></head><body>{children}<Script src={`${base}/analytics.js`} strategy="afterInteractive" /></body></html>;
}
