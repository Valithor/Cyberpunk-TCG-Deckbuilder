import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page not found",
  description: "The requested page could not be found.",
  metadataBase: new URL("https://valithor.github.io/"),
  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    title: "Page not found",
    description: "The requested page could not be found.",
    siteName: "Cyberpunk TCG Deckbuilder",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Page not found",
    description: "The requested page could not be found.",
  },
}

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <h1 className="flex flex-col items-center justify-center gap-2">
        <div className="text-3xl text-primary">404</div>
        <div>Page not found</div>
      </h1>
    </div>
  )
}
