import {
  CompatibleCards,
  CompatibleLegends,
  DeckPreview,
} from "@/components/ui/deck/deck"
import { CardList } from "@/components/ui/gameCard"
import { Separator } from "@/components/ui/separator"

export default async function Page() {
  return (
    <div className="mx-auto flex h-full w-full flex-1 flex-col gap-4 gap-30 text-sm leading-loose">
      <div className="flex flex-1 flex-col items-start sm:flex-row">
        <DeckPreview />
        <Separator orientation="vertical" />
        <div className="flex flex-1 flex-col gap-6 bg-background p-10 self-stretch">
          <h1 className="text-center text-2xl">
            Build your own{" "}
            <span className="text-primary">Cyberpunk TCG Deck!</span>
          </h1>
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
