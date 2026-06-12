import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import CloudSync from '@/components/CloudSync'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  title: 'Creator Growth Studio',
  description: 'The AI content studio that writes in your voice, designs your graphics, and gets you posting in under 60 seconds.',
  keywords: 'content creator, AI content, personal brand, social media, quote generator',
  openGraph: {
    title: 'Creator Growth Studio',
    description: 'AI-powered content studio for personal brands.',
    url: 'https://creatorgrowthstudio.app',
    siteName: 'Creator Growth Studio',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </head>
        <body className={dmSans.className} style={{ background: '#ffffff' }}>
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var theme = localStorage.getItem('cgs_theme');
                document.body.style.background = theme === 'dark' ? '#050507' : '#ffffff';
              } catch(e) {}
            })();
          `}} />
          <div style={{ maxWidth: '430px', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
            <CloudSync>{children}</CloudSync>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
