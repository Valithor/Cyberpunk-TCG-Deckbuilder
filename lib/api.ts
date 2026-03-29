export interface CardsReturnT {
  items: CardT[]
  limit: number
  offset: number
  total: number
}

export type CardType = "Legend" | "Unit" | "Gear" | "Program"

export type CardColor = "Red" | "Blue" | "Green" | "Yellow"

export interface CardT {
  id: string
  external_id: string
  name: string
  subname: string
  display_name: string
  slug: string
  rules_text: string
  flavor_text: any
  set: Set
  rarity: any
  image_url: string
  source_image_url: string
  color: CardColor
  card_type: CardType
  is_eddiable: boolean
  classifications: string[]
  keywords: string[]
  cost: number
  power: number
  ram: number
  artist: string
  print_number: string
  printings: any[]
  selected_printing_id: any
  legality: string
}

export interface Set {
  code: string
  name: string
}


export function getCards() {
  return fetch(
    "https://api.netdeck.gg/api/cards/cyberpunk?limit=60&offset=0"
  ).then((r) => r.json() as Promise<CardsReturnT>)
}
