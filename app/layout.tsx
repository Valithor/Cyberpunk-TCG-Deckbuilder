import { Orbitron } from "next/font/google"
import "@total-typescript/ts-reset"

import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", "font-mono font-bold", orbitron.variable)}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Separator />
        <footer className="p-10 pb-20 text-center text-primary md:pb-10">
          This is a personal project and is not affiliated with or endorsed by
          CD PROJEKT RED or Weird Co.
          <div>Created by TheMoses</div>
        </footer>
      </body>
    </html>
  )
}
