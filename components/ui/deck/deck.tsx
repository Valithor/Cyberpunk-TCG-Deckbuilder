"use client"

import { cardsDb } from "@/api/cards-db"
import { CardColor, CardT } from "@/lib/api"
import { cn, sum } from "@/lib/utils"
import React from "react"
import { toast } from "sonner"
import { GameCard } from "../gameCard"
import { QuestionIcon } from "@phosphor-icons/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { Progress } from "../progress"

interface DeckT {
  legends: Array<string>
  cards: Array<{ id: string; count: number }>
}

const DeckContext = React.createContext<DeckT | null>(null)

function useDeck() {
  const ctx = React.useContext(DeckContext)
  if (!ctx) throw new Error("Wrap your components using Deck wrapper.")
  return ctx
}

interface DeckDispatchContext {
  dispatch: React.ActionDispatch<DeckActionPayload>
}

const DeckDispatchContext = React.createContext<DeckDispatchContext | null>(
  null
)

function useDeckDispatch() {
  const ctx = React.useContext(DeckDispatchContext)
  if (!ctx) throw new Error("Wrap your components using Deck wrapper.")
  return ctx
}

interface DeckActionAddCard {
  type: "ADD_CARD"
  value: CardT
}
interface DeckActionRemoveCard {
  type: "REMOVE_CARD"
  value: CardT
}

type DeckActionPayload = [DeckActionAddCard | DeckActionRemoveCard]

function validateNewLegend(deck: DeckT, card: CardT) {
  if (deck.legends.includes(card.id))
    return "Deck can't have multiple copies of the same legend."
  if (deck.legends.length >= 3) return "Deck can't have more than 3 legends."
  return true
}

function countCards(deck: DeckT) {
  return sum(deck.cards.map((c) => c.count))
}

function validateNewCard(deck: DeckT, card: CardT) {
  //min 40 cards
  if (countCards(deck) >= 50) return "Deck can't have more than 50 cards."
  const ramMax = cardsDb.calculateRam(deck.legends)[card.color]
  console.log(card.color, cardsDb.calculateRam(deck.legends))
  if (card.ram > cardsDb.calculateRam(deck.legends)[card.color])
    return `This card exceeds max current ram level. Current ram level for ${card.color} is ${ramMax}.`
  const exists = deck.cards.find((c) => c.id === card.id)
  if (exists && exists.count >= 3)
    return "You can't include more than 3 copies of the same card."
  return true
}

export function Deck({ children }: React.ComponentProps<"div">) {
  const [error, setError] = React.useState<{ message: string }>()
  const [deck, dispatch] = React.useReducer<DeckT, DeckActionPayload>(
    (state, action) => {
      switch (action.type) {
        case "ADD_CARD": {
          if (
            action.value.card_type === "Legend" &&
            validateNewLegend(state, action.value)
          ) {
            const message = validateNewLegend(state, action.value)
            if (typeof message === "string") {
              setError({ message })
              return state
            }
            return {
              ...state,
              legends: [...state.legends, action.value.id],
            }
          }
          const message = validateNewCard(state, action.value)
          if (typeof message === "string") {
            setError({ message })
            return state
          }
          const existingIndex = state.cards.findIndex(
            (c) => c.id === action.value.id
          )

          if (existingIndex !== -1) {
            const updatedCards = [...state.cards]
            updatedCards[existingIndex] = {
              ...updatedCards[existingIndex],
              count: updatedCards[existingIndex].count + 1,
            }

            return {
              ...state,
              cards: updatedCards,
            }
          }

          return {
            ...state,
            cards: [...state.cards, { id: action.value.id, count: 1 }],
          }
        }
        case "REMOVE_CARD": {
          if (
            action.value.card_type === "Legend" &&
            validateNewLegend(state, action.value)
          ) {
            return {
              ...state,
              legends: state.legends.filter((l) => l !== action.value.id),
            }
          }
          const existingIndex = state.cards.findIndex(
            (c) => c.id === action.value.id
          )

          if (existingIndex !== -1) {
            const updatedCards = [...state.cards]
            updatedCards[existingIndex] = {
              ...updatedCards[existingIndex],
              count: updatedCards[existingIndex].count - 1,
            }

            return {
              ...state,
              cards: updatedCards.filter((c) => c.count > 0),
            }
          }

          return state
        }
      }
    },
    { cards: [], legends: [] }
  )
  React.useEffect(() => {
    if (error) toast(error.message)
  }, [error])
  return (
    <DeckContext.Provider value={deck}>
      <DeckDispatchContext.Provider value={{ dispatch }}>
        {children}
      </DeckDispatchContext.Provider>
    </DeckContext.Provider>
  )
}

export function AddToDeckButton({
  card,
  ...props
}: React.ComponentProps<"button"> & { card: CardT }) {
  const { dispatch } = useDeckDispatch()
  const addCardAction = React.useCallback(() => {
    dispatch({ type: "ADD_CARD", value: card })
  }, [dispatch])
  return (
    <button
      {...props}
      className="max-w-40 cursor-pointer bg-background transition-all hover:scale-105 hover:opacity-80 active:translate-y-[1px] active:scale-95 md:max-w-80"
      onClick={addCardAction}
    />
  )
}
export function RemoveFromDeckButton({
  card,
  className,
  ...props
}: React.ComponentProps<"button"> & { card: CardT }) {
  const { dispatch } = useDeckDispatch()
  const addCardAction = React.useCallback(() => {
    dispatch({ type: "REMOVE_CARD", value: card })
  }, [dispatch])
  return (
    <button
      {...props}
      className={cn(
        "h-10 cursor-pointer overflow-hidden border transition-all hover:scale-105 hover:opacity-80 active:translate-y-[1px] active:scale-95",
        cardColor[card.color],
        className
      )}
      onClick={addCardAction}
    />
  )
}

const cardColor: Record<CardColor, string> = {
  Red: "border-red-500 text-red-500",
  Yellow: "border-yellow-500 text-yellow-500",
  Green: "border-green-500 text-green-500",
  Blue: "border-blue-500 text-blue-500",
}

export function DeckPreview() {
  const deck = useDeck()
  const { legends, cards } = deck
  const ram = cardsDb.calculateRam(legends)
  const count = countCards(deck)
  return (
    <div className="sticky top-10 flex w-75 flex-col gap-3 bg-muted p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Your deck</h2>
        <Tooltip>
          <TooltipTrigger>
            <QuestionIcon className="text-yellow-300" weight="fill" />
          </TooltipTrigger>
          <TooltipContent>
            If you want to remove any card from your deck simply click on them!
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex h-5 items-center justify-between">
        <h3 className="text-xs">Max ram:</h3>
        <div className="flex gap-1">
          {Object.values(ram).some((v) => v > 0) ? (
            Object.entries(ram).map(([k, v]) =>
              v > 0 ? (
                <div
                  key={k}
                  className={cn(
                    "text-md flex size-5 items-center justify-center border",
                    cardColor[k as CardColor]
                  )}
                >
                  {v}
                </div>
              ) : null
            )
          ) : (
            <div className="text-muted-foreground">None</div>
          )}
        </div>
      </div>
      <h3>Legends:</h3>
      <Progress value={(legends.length / 3) * 100} />
      <div className="flex flex-1 flex-col gap-1">
        {legends.length > 0 ? (
          legends.map((id) => {
            const card = cardsDb.getById(id)
            if (!card) return null
            return (
              <RemoveFromDeckButton key={id} card={card}>
                <GameCard
                  src={card.image_url}
                  alt={card.name}
                  className="w-full"
                />
              </RemoveFromDeckButton>
            )
          })
        ) : (
          <div className="m-auto max-w-6/10 text-center text-muted-foreground">
            Add cards by clicking on them.
          </div>
        )}
      </div>
      <h3>Cards:</h3>
      <div className="flex">
        <Progress value={(count / 40) * 100} className="flex-4"/>
        <Progress value={((count - 40) / 10) * 100} className="flex-1" indicatorClassName="bg-destructive" />
      </div>
      <div className="flex flex-col gap-1">
        {cards.length > 0 ? (
          cards.map(({ id, count }) => {
            const card = cardsDb.getById(id)
            if (!card) return null
            return (
              <RemoveFromDeckButton key={id} card={card} className="relative">
                <GameCard
                  src={card.image_url}
                  alt={card.name}
                  className="w-full -translate-y-6/10"
                />
                <div className="pointer-events-none absolute top-0 right-0 flex size-10 items-center justify-center rounded-l-sm bg-background/80 text-foreground">
                  x{count}
                </div>
              </RemoveFromDeckButton>
            )
          })
        ) : (
          <div className="m-auto max-w-6/10 text-center text-muted-foreground">
            Add cards by clicking on them.
          </div>
        )}
      </div>
    </div>
  )
}

export function CompatibleLegends() {
  const deck = useDeck()

  return cardsDb
    .getLegends()
    .filter((c) => validateNewLegend(deck, c) === true)
    .map((c) => (
      <AddToDeckButton key={c.id} card={c}>
        <GameCard src={c.image_url} alt={c.name} />
      </AddToDeckButton>
    ))
}

export function CompatibleCards() {
  const deck = useDeck()

  return cardsDb
    .getAll()
    .filter((c) => c.card_type !== "Legend")
    .filter((c) => validateNewCard(deck, c) === true)
    .map((c) => (
      <AddToDeckButton key={c.id} card={c}>
        <GameCard src={c.image_url} alt={c.name} />
      </AddToDeckButton>
    ))
}
