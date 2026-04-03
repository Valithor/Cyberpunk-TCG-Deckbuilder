import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CompatibleCards,
  CompatibleLegends,
  Deck,
  DeckCount,
  DeckPreview,
  HeadingCards,
  HeadingLegends,
  LoadDeck,
} from "@/components/ui/deck/deck";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CardList } from "@/components/ui/gameCard";
import { Separator } from "@/components/ui/separator";
import { StackIcon } from "@phosphor-icons/react/dist/ssr";
import { AccessibleIcon } from "@radix-ui/react-accessible-icon";

import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: {
    default: "Cyberpunk TCG Deckbuilder",
    template: "%s | Cyberpunk TCG Deckbuilder",
  },
  description:
    "Build, optimize, and share your Cyberpunk TCG decks. Fast and intuitive deckbuilder for your favourite card game.",
  metadataBase: new URL("https://valithor.github.io"),

  applicationName: "Cyberpunk TCG Deckbuilder",

  keywords: [
    "cyberpunk",
    "tcg",
    "deckbuilder",
    "card game",
    "deck building",
    "strategy",
    "cards",
    "online deck builder",
  ],

  authors: [{ name: "TheMoses", url: "https://github.com/Valithor" }],
  creator: "TheMoses",
  publisher: "TheMoses",
  openGraph: {
    title: "Cyberpunk TCG Deckbuilder",
    description:
      "Build, optimize, and share your Cyberpunk TCG decks. Fast and intuitive deckbuilder for your favourite card game.",
    url: new URL("https://valithor.github.io/Cyberpunk-TCG-Deckbuilder/"),
    siteName: "Cyberpunk TCG Deckbuilder",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary",
    title: "Cyberpunk TCG Deckbuilder",
    description:
      "Build, optimize, and share your Cyberpunk TCG decks. Fast and intuitive deckbuilder for your favourite card game.",
  },
  manifest:
    "https://valithor.github.io/Cyberpunk-TCG-Deckbuilder/manifest.json",

  robots: {
    index: true,
    follow: true,
  },

  category: "games",
};

export default async function Page() {
  return (
    <Deck>
      <main className="mx-auto flex h-full w-full flex-1 flex-col gap-4 gap-30 text-sm leading-loose">
        <div className="flex flex-1 flex-col items-start sm:flex-row">
          <DeckPreview className="sticky top-0 hidden md:flex" />
          <Separator orientation="vertical" className="hidden md:block" />
          <div className="flex flex-1 flex-col gap-6 self-stretch bg-background p-10">
            <h1 className="py-6 text-center text-3xl">
              Build your own{" "}
              <span className="text-primary">Cyberpunk TCG Deck!</span>
            </h1>
            <section id="legend">
              <h2 className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center border border-primary text-2xl text-primary">
                  1
                </div>
                <HeadingLegends />
              </h2>
              <div>
                <CardList>
                  <CompatibleLegends />
                </CardList>
              </div>
            </section>
            <Separator />
            <section id="other">
              <h2 className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center border border-primary text-2xl text-primary">
                  2
                </div>
                <HeadingCards />
              </h2>
              <div>
                <CardList>
                  <CompatibleCards />
                </CardList>
              </div>
            </section>
          </div>
        </div>
        <Drawer direction="top">
          <DrawerTrigger className="fixed bottom-6 left-6 md:hidden" asChild>
            <Button size="icon-lg">
              <AccessibleIcon label="Deck">
                <StackIcon />
              </AccessibleIcon>
              <Badge
                variant="secondary"
                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
              >
                <DeckCount />
              </Badge>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="overflow-auto p-4">
            <DrawerTitle className="sr-only">Deck</DrawerTitle>
            <DrawerDescription className="sr-only">
              Here you can preview and share your deck. Clicking on a card will
              remove it from the deck. In order to add new cards close this
              modal and click on cards on the previous view.
            </DrawerDescription>
            <DeckPreview className="w-full" />
          </DrawerContent>
        </Drawer>
      </main>
      <React.Suspense>
        <LoadDeck />
      </React.Suspense>
    </Deck>
  );
}
