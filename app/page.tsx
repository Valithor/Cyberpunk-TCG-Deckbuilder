import { cardsDb } from "@/api/cards-db"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AddToDeckButton,
  CompatibleCards,
  CompatibleLegends,
  Deck,
  DeckPreview,
} from "@/components/ui/deck/deck"
import { CardList, GameCard } from "@/components/ui/gameCard"
import { Separator } from "@/components/ui/separator"
import { getCards } from "@/lib/api"

export default async function Page() {
  return (
    <div className="mx-auto px-5 md:px-10 flex h-full flex-1 w-full max-w-[1600px] flex-col gap-4 gap-30 text-sm leading-loose">
      <h1 className="text-center text-2xl">
        Build your own <span className="text-primary">Cyberpunk TCG Deck!</span>
      </h1>
      <div className="flex items-start gap-10 flex-1 flex-col sm:flex-row">
        <DeckPreview />
        <Separator orientation="vertical"/>
        <div className="flex flex-1 flex-col gap-4">
          <section id="legend">
            <h2 className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center border border-primary text-2xl text-primary">
                1
              </div>
              Choose 3 legends.
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
              Add at least 40 cards.
            </h2>
            <div>
              <CardList>
                <CompatibleCards />
              </CardList>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
