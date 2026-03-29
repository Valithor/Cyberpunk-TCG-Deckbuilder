import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { Deck } from "@/components/ui/deck/deck"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        "font-mono",
        jetbrainsMono.variable
      )}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col gap-10">
        <TooltipProvider>
          <Deck>{children}</Deck>
        </TooltipProvider>
        <Toaster />
        <Separator />
        <footer className="text-center pb-10">
          This is a personal project and is not affiliated with or endorsed by
          CD PROJEKT RED or Weird Co.
        </footer>
      </body>
    </html>
  )
}
