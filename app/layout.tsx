import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"
import { FeedbackPanel } from "@/components/feedback-panel"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ArtisanAI - AI Image Generator",
  description: "Generate consistent, high-quality images with AI. Upload reference photos and create stunning portraits, 3D models, and more.",
  generator: "ArtisanAI",
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=3', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png?v=3', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.png?v=3', type: 'image/png', sizes: '372x376' },
      { url: '/favicon.ico?v=3', sizes: 'any' },
    ],
    shortcut: '/favicon-32x32.png?v=3',
    apple: '/favicon-32x32.png?v=3',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
        <link rel="icon" type="image/png" sizes="372x376" href="/favicon.png?v=3" />
        <link rel="shortcut icon" href="/favicon-32x32.png?v=3" />
        <link rel="apple-touch-icon" href="/favicon-32x32.png?v=3" />
        <meta name="theme-color" content="#6366f1" />
        <script defer src="https://cloud.umami.is/script.js" data-website-id="131efb81-12bc-44bb-ba93-2fcb9cd9b048"></script>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <LanguageProvider>
              <Navigation />
              <main>{children}</main>
              <FeedbackPanel />
              <Toaster />
            </LanguageProvider>
          </ThemeProvider>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
