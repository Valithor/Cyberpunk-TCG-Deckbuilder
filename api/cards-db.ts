import cardsData from "@/data/cards.json"
import { CardColor, CardsReturnT } from "@/lib/api"

const DEFAULT_RAM: Record<CardColor, number> = {
  Blue: 0,
  Green: 0,
  Red: 0,
  Yellow: 0,
}

export const cardsDb = (() => {
  const data = cardsData as CardsReturnT
  const mapById = new Map(data.items.map((c) => [c.id, c]))
  const mapBySlug = new Map(data.items.map((c) => [c.slug, c]))

  return {
    getAll() {
      return data.items
    },

    getById(id: string) {
      return mapById.get(id) ?? null
    },

    getBySlug(slug: string) {
      return mapBySlug.get(slug) ?? null
    },
    getByIds(slugs: string[]) {
      return data.items.filter((c) => slugs.includes(c.id))
    },
    getLegends() {
      return data.items.filter((c) => c.card_type === "Legend")
    },

    calculateRam(ids: string[]) {
      return data.items
        .filter((c) => c.card_type === "Legend")
        .filter((c) => ids.includes(c.id))
        .reduce(
          (p, { color, ram }) => ({ ...p, [color]: p[color] + ram }),
          DEFAULT_RAM
        )
    },
  }
})()
