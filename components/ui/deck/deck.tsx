"use client"

import { cardsDb, DEFAULT_RAM } from "@/api/cards-db"
import { CardColor, CardT } from "@/lib/api"
import { cn, sum } from "@/lib/utils"
import React from "react"
import { toast } from "sonner"
import { GameCard } from "@/components/ui/gameCard"
import { WarningIcon, QuestionIcon, TrashIcon } from "@phosphor-icons/react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { AccessibleIcon } from "@radix-ui/react-accessible-icon"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "../input"
import { ButtonGroup } from "../button-group"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../alert-dialog"

const LEGEND_LIMIT = 3
const SAME_COPY_LIMIT = 3
const MIN_DECK_SIZE = 40
const MAX_DECK_SIZE = 50

type MaxRam = Record<CardColor, number>

interface DeckMinT {
  legends: Array<string>
  cards: Array<{ id: string; count: number }>
}
interface DeckT {
  legends: Array<CardT>
  cards: Array<{ card: CardT; count: number }>
  ram: MaxRam
  total: number
}

const DeckContext = React.createContext<DeckT | null>(null)

function useDeck() {
  const ctx = React.useContext(DeckContext)
  if (!ctx) throw new Error("Wrap your components using Deck wrapper.")
  return ctx
}

interface DeckDispatchContext {
  handleAddCard: (card: CardT) => void
  handleRemoveCard: (card: CardT) => void
  handleSetDeck: (deck: DeckMinT) => void
  handleRemoveAll: () => void
  handleRemoveInvalid: () => void
}

const DeckDispatchContext = React.createContext<DeckDispatchContext | null>(
  null
)

function useDeckActions() {
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
interface DeckActionSetDeck {
  type: "SET_DECK"
  value: DeckMinT
}
interface DeckActionClearAll {
  type: "CLEAR_ALL"
}
interface DeckActionClearInvalid {
  type: "CLEAR_INVALID"
}

type DeckActionPayload = [
  | DeckActionAddCard
  | DeckActionRemoveCard
  | DeckActionSetDeck
  | DeckActionClearAll
  | DeckActionClearInvalid,
]

const getCardNames = (cards: CardT[]) => cards.map((c) => c.name)

function useLegendRules() {
  const deck = useDeck()
  const rules = []
  if (deck.legends.length !== LEGEND_LIMIT)
    rules.push(`Deck must include exactly ${LEGEND_LIMIT} legends.`)

  const cardNames = getCardNames(deck.legends)
  if (cardNames.length !== new Set(cardNames).size)
    rules.push("All legends need to have unique names.")
  return [!!rules.length, rules] as const
}
function useCardRules() {
  const deck = useDeck()
  const rules = []
  const count = countCards(deck.cards)
  if (count < MIN_DECK_SIZE || count > MAX_DECK_SIZE)
    rules.push(`Deck must consist of ${MIN_DECK_SIZE}-${MAX_DECK_SIZE} cards.`)
  if (deck.cards.some((c) => c.count > SAME_COPY_LIMIT))
    rules.push(`Some cards exceed limit ${SAME_COPY_LIMIT} copies limit.`)
  if (deck.cards.some((c) => !validateRam(c.card, deck.ram)))
    rules.push("Some cards exceed ram limit.")
  return [!!rules.length, rules] as const
}
const validateRam = (card: CardT, maxRam: MaxRam) =>
  maxRam[card.color] >= card.ram

function validateNewLegend(deck: DeckT, card: CardT, isNew = true) {
  if (isNew && deck.legends.some((l) => l.name === card.name))
    return "All legends need to have unique names."
  if (deck.legends.length >= LEGEND_LIMIT)
    return `Deck can't have more than ${LEGEND_LIMIT} legends.`
  return true
}

function countCards(cards: DeckT["cards"]) {
  return sum(cards.map((c) => c.count))
}

function validateNewCard(deck: DeckT, card: CardT, isNew = true) {
  if (isNew) {
    if (countCards(deck.cards) >= MAX_DECK_SIZE)
      return `Deck can't have more than ${MAX_DECK_SIZE} cards.`
  }
  const ramMax = deck.ram[card.color]
  if (card.ram > ramMax)
    return `This card exceeds max current ram level. Current ram level for ${card.color} is ${ramMax}.`
  const exists = deck.cards.find((c) => c.card.id === card.id)
  if (
    (isNew && exists && exists.count > SAME_COPY_LIMIT - 1) ||
    (!isNew && exists && exists.count > SAME_COPY_LIMIT)
  )
    return `You can't include more than ${SAME_COPY_LIMIT} copies of the same card.`
  return true
}

function isError(validationReturn: true | string) {
  return typeof validationReturn === "string"
}

function getDeck(deckMin: DeckMinT) {
  const legends = cardsDb.getByIds(deckMin.legends)
  const cards = deckMin.cards
    .map((c) => {
      const card = cardsDb.getById(c.id)
      if (!card) return null
      return { count: c.count, card }
    })
    .filter(Boolean)
  return {
    legends,
    cards,
    ram: legends
      .filter((c) => isLegend(c))
      .reduce(
        (p, { color, ram }) => ({ ...p, [color]: p[color] + ram }),
        DEFAULT_RAM
      ),
    total: countCards(cards),
  }
}

const isLegend = (card: CardT) => card.card_type === "Legend"

export function Deck({ children }: React.ComponentProps<"div">) {
  const [error, setError] = React.useState<{ message: string }>()
  const [deckIds, dispatch] = React.useReducer<DeckMinT, DeckActionPayload>(
    (state, action) => {
      switch (action.type) {
        case "ADD_CARD": {
          if (isLegend(action.value)) {
            return {
              ...state,
              legends: [...state.legends, action.value.id],
            }
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
          if (isLegend(action.value)) {
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
        case "SET_DECK": {
          return action.value
        }
        case "CLEAR_ALL": {
          return { cards: [], legends: [] }
        }
        case "CLEAR_INVALID": {
          return {
            ...state,
            cards: state.cards.filter((c) => {
              const deck = getDeck(state)
              const card = deck.cards.find((ca) => ca.card.id === c.id)?.card
              if (!card) return false
              return !isError(validateNewCard(deck, card, false))
            }),
          }
        }
      }
    },
    {
      cards: [],
      legends: [],
    }
  )
  React.useEffect(() => {
    if (error) toast(error.message)
  }, [error])

  const deck: DeckT = React.useMemo(() => getDeck(deckIds), [deckIds])

  const handleAddCard = React.useCallback(
    (card: CardT) => {
      const message = isLegend(card)
        ? validateNewLegend(deck, card)
        : validateNewCard(deck, card)
      if (isError(message)) {
        setError({ message })
        return
      }
      dispatch({ type: "ADD_CARD", value: card })
    },
    [deck]
  )
  const handleRemoveCard = React.useCallback((card: CardT) => {
    dispatch({ type: "REMOVE_CARD", value: card })
  }, [])
  const handleSetDeck = React.useCallback((deck: DeckMinT) => {
    dispatch({ type: "SET_DECK", value: deck })
  }, [])

  const handleClearAll = React.useCallback(() => {
    dispatch({ type: "CLEAR_ALL" })
  }, [])

  const handleClearInvalid = React.useCallback(() => {
    dispatch({ type: "CLEAR_INVALID" })
  }, [])

  return (
    <DeckContext.Provider value={deck}>
      <DeckDispatchContext.Provider
        value={{
          handleAddCard,
          handleRemoveCard,
          handleRemoveAll: handleClearAll,
          handleRemoveInvalid: handleClearInvalid,
          handleSetDeck,
        }}
      >
        {children}
      </DeckDispatchContext.Provider>
    </DeckContext.Provider>
  )
}

export function AddToDeckButton({
  card,
  ...props
}: React.ComponentProps<"button"> & { card: CardT }) {
  const { handleAddCard } = useDeckActions()
  const addCardAction = React.useCallback(
    () => handleAddCard(card),
    [card, handleAddCard]
  )
  return (
    <button
      {...props}
      aria-label="Add card"
      className="max-w-40 cursor-pointer bg-background transition-all hover:scale-105 hover:opacity-80 active:translate-y-[1px] active:scale-95 md:max-w-80"
      onClick={addCardAction}
    />
  )
}

const cardColor: Record<CardColor, string> = {
  Red: "border-red-500",
  Yellow: "border-yellow-500",
  Green: "border-green-500",
  Blue: "border-blue-500",
}

export function RemoveFromDeckButton({
  card,
  className,
  ...props
}: React.ComponentProps<"button"> & { card: CardT }) {
  const { handleRemoveCard } = useDeckActions()
  const addCardAction = React.useCallback(
    () => handleRemoveCard(card),
    [card, handleRemoveCard]
  )
  return (
    <button
      {...props}
      aria-label="Remove card"
      className={cn(
        "h-10 cursor-pointer overflow-hidden border transition-all hover:scale-105 hover:opacity-80 active:translate-y-[1px] active:scale-95",
        cardColor[card.color],
        className
      )}
      onClick={addCardAction}
    />
  )
}

const ramStyles: Record<CardColor, string> = {
  Red: "border-black bg-red-500 text-black",
  Yellow: "border-black bg-yellow-500 text-black",
  Green: "border-black bg-green-500 text-black",
  Blue: "border-black bg-blue-500 text-black",
}

function legendsToSearchParams(legends: DeckT["legends"]) {
  return legends.map((l) => cardsDb.getCustomId(l.id)).join(",")
}
function cardsToSearchParams(cards: DeckT["cards"]) {
  return cards
    .map((c) => {
      const id = cardsDb.getCustomId(c.card.id)
      if (!id) return null
      return `${id}:${c.count}`
    })
    .filter(Boolean)
    .join(",")
}
function cardsFromSearchParams(searchParams: URLSearchParams) {
  return (searchParams.get("c") || "")
    .split(",")
    .map((entry) => {
      const [i, count] = entry.split(":").map(Number)
      const id = cardsDb.getOriginalId(i)
      if (!id) return null
      return { count, id }
    })
    .filter(Boolean)
}
function legendsFromSearchParams(searchParams: URLSearchParams) {
  return (searchParams.get("l") || "")
    .split(",")
    .map((i) => cardsDb.getOriginalId(Number(i)))
    .filter(Boolean)
}

function ShareDeckButton() {
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false)
  const { cards, legends } = useDeck()

  const getUrl = React.useCallback(() => {
    if (typeof window === "undefined") return ""
    return (
      window.location +
      "?" +
      new URLSearchParams({
        l: legendsToSearchParams(legends),
        c: cardsToSearchParams(cards),
      }).toString()
    )
  }, [legends, cards])
  const handleShare = React.useCallback(async () => {
    try {
      const url = getUrl()
      await navigator.clipboard.writeText(url)
      setIsSuccess(true)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setIsSuccess(false)
    }
  }, [getUrl])

  return (
    <Dialog>
      <DialogTrigger onClick={handleShare} asChild>
        <Button>Share Deck</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isSuccess
            ? "Couldn't copy URL address. Try copying URL below."
            : "URL has been copied, but if you ever lose it you can copy it from the field below."}
        </DialogDescription>
        <Input value={getUrl()} readOnly />
      </DialogContent>
    </Dialog>
  )
}

export function HeadingLegends() {
  const { legends } = useDeck()
  return (
    <span className="text-lg">
      Choose <span className="text-primary">{LEGEND_LIMIT - legends.length} legends.</span>
    </span>
  )
}

export function HeadingCards() {
  const { total } = useDeck()
  if (total >= MIN_DECK_SIZE)
    return (
      <span className="text-lg">
        You&apos;ve met minimum requirements, but you can still add{" "}
        <span className="text-primary">{MAX_DECK_SIZE - total} cards.</span>
      </span>
    )
  return (
    <span className="text-lg">
      Add at least{" "}
      <span className="text-primary">{MIN_DECK_SIZE - total} cards.</span>
    </span>
  )
}

export function DeckPreview({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const deck = useDeck()
  const { handleRemoveAll, handleRemoveInvalid } = useDeckActions()
  const { legends, cards, ram, total } = deck
  const [hasLegendsErrors, legendsErrors] = useLegendRules()
  const [hasCardsErrors, cardsErrors] = useCardRules()

  return (
    <article className={cn("flex w-75 flex-col", className)} {...props}>
      <div className="flex flex-col gap-[inherit] bg-primary px-5 py-5 text-primary-foreground">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Your deck</h2>
          <ul aria-label="Max ram" className="flex h-8 gap-1">
            {Object.values(ram).some((v) => v > 0)
              ? Object.entries(ram).map(([k, v]) =>
                  v > 0 ? (
                    <li
                      key={k}
                      aria-label={`${k} ram`}
                      className={cn(
                        "text-md flex aspect-square items-center justify-center border",
                        ramStyles[k as CardColor]
                      )}
                    >
                      {v}
                    </li>
                  ) : null
                )
              : null}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-6 px-5 py-8">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <h3 className="text-lg">Legends:</h3>
            <div className="flex gap-1">
              <Tooltip clickable>
                <TooltipTrigger>
                  <AccessibleIcon label="Tip">
                    <QuestionIcon
                      className="size-6 text-primary"
                      weight="fill"
                    />
                  </AccessibleIcon>
                </TooltipTrigger>
                <TooltipContent>
                  If you want to remove any card simply click on them!
                </TooltipContent>
              </Tooltip>
              {hasLegendsErrors ? (
                <Tooltip clickable>
                  <TooltipTrigger>
                    <AccessibleIcon label="Show errors">
                      <WarningIcon
                        weight="fill"
                        className="size-6 shrink-0 text-destructive"
                      />
                    </AccessibleIcon>
                  </TooltipTrigger>
                  <TooltipContent className="block">
                    <ul className="list-inside list-disc">
                      {legendsErrors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
          <Progress value={(legends.length / LEGEND_LIMIT) * 100} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          {legends.length > 0 ? (
            legends.map((l) => {
              return (
                <Tooltip key={l.id}>
                  <TooltipTrigger asChild>
                    <RemoveFromDeckButton card={l} className="relative">
                      <GameCard
                        src={l.image_url}
                        alt={l.name}
                        className="w-full"
                      />
                      <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center bg-background/40 px-4 text-foreground">
                        {l.name}
                      </div>
                    </RemoveFromDeckButton>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={8}
                    hideArrow
                    side="right"
                    className="bg-transparent p-0"
                  >
                    <GameCard src={l.image_url} alt={l.name} />
                  </TooltipContent>
                </Tooltip>
              )
            })
          ) : (
            <div className="m-auto max-w-6/10 text-center text-muted-foreground">
              Add cards by clicking on them.
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between">
            <h3 className="text-lg">Cards:</h3>
            <div className="flex gap-1">
              <Tooltip clickable>
                <TooltipTrigger>
                  <AccessibleIcon label="Tip">
                    <QuestionIcon
                      className="size-6 text-primary"
                      weight="fill"
                    />
                  </AccessibleIcon>
                </TooltipTrigger>
                <TooltipContent>
                  If you want to remove any card simply click on them!
                </TooltipContent>
              </Tooltip>
              {hasCardsErrors ? (
                <Tooltip clickable>
                  <TooltipTrigger>
                    <AccessibleIcon label="Show errors">
                      <WarningIcon
                        weight="fill"
                        className="size-6 shrink-0 text-destructive"
                      />
                    </AccessibleIcon>
                  </TooltipTrigger>
                  <TooltipContent className="block">
                    <ul className="list-inside list-disc">
                      {cardsErrors.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </div>
          <div className="flex">
            <Progress
              value={(total / MIN_DECK_SIZE) * 100}
              className="flex-4"
            />
            <Progress
              value={
                ((total - MIN_DECK_SIZE) / (MAX_DECK_SIZE - MIN_DECK_SIZE)) *
                100
              }
              className="flex-1"
              indicatorClassName="bg-destructive"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {cards.length > 0 ? (
            cards.map(({ card, count }) => {
              return <ValidatedCard key={card.id} card={card} count={count} />
            })
          ) : (
            <div className="m-auto max-w-6/10 text-center text-muted-foreground">
              Add cards by clicking on them.
            </div>
          )}
        </div>
        <ButtonGroup className="ml-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" title="Remove invalid cards">
                <TrashIcon />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  This action cannot be undone.
                </AlertDialogTitle>
                <AlertDialogDescription>
                  It will remove{" "}
                  <span className="text-primary">invalid cards</span> from the
                  deck.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveInvalid}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" title="Remove all cards">
                <TrashIcon weight="fill" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  This action cannot be undone.
                </AlertDialogTitle>
                <AlertDialogDescription>
                  It will remove <span className="text-primary">all cards</span>{" "}
                  from the deck.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemoveAll}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ButtonGroup>
        <ShareDeckButton />
      </div>
    </article>
  )
}

export function LoadDeck() {
  const { handleSetDeck } = useDeckActions()
  const previousLoadRef = React.useRef("")
  const searchParams = useSearchParams()
  React.useEffect(() => {
    const spString = searchParams.toString()
    if (!spString || previousLoadRef.current === spString) return
    previousLoadRef.current = spString
    handleSetDeck({
      cards: cardsFromSearchParams(searchParams) ?? [],
      legends: legendsFromSearchParams(searchParams) ?? [],
    })
  }, [searchParams, handleSetDeck])
  return null
}

export function DeckCount() {
  const { total, legends } = useDeck()
  return total + legends.length
}

function ValidatedCard({
  className,
  card,
  count,
  ...props
}: React.ComponentProps<"div"> & { card: CardT; count: number }) {
  const deck = useDeck()
  const message = validateNewCard(deck, card, false)
  const invalid = isError(message)

  const element = (
    <Tooltip>
      <TooltipTrigger asChild>
        <RemoveFromDeckButton card={card} className="relative">
          <GameCard src={card.image_url} alt={card.name} className="w-full" />
          <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center bg-background/40 px-4 text-foreground">
            {card.name}
          </div>
          <div className="pointer-events-none absolute top-0 right-0 flex size-10 items-center justify-center rounded-l-sm bg-background/80 text-foreground">
            x{count}
          </div>
          {invalid ? (
            <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center bg-destructive/40 px-4"></div>
          ) : null}
        </RemoveFromDeckButton>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={8}
        hideArrow
        side="right"
        className="bg-transparent p-0"
      >
        <GameCard src={card.image_url} alt={card.name} />
      </TooltipContent>
    </Tooltip>
  )
  if (!invalid) return element
  return (
    <div
      aria-invalid
      className={cn("flex items-center gap-4", className)}
      {...props}
    >
      {element}
      <Tooltip clickable>
        <TooltipTrigger>
          <AccessibleIcon label="Show errors">
            <WarningIcon
              weight="fill"
              className="size-6 shrink-0 text-destructive"
            />
          </AccessibleIcon>
        </TooltipTrigger>
        <TooltipContent className="block">{message}</TooltipContent>
      </Tooltip>
    </div>
  )
}

function Fallback({ className, ...rest }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-center p-10", className)}
      {...rest}
    />
  )
}

export function CompatibleLegends() {
  const deck = useDeck()
  const [hasErrors] = useLegendRules()

  if (!hasErrors) return <Fallback> All set!</Fallback>

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
  const availableCards = cardsDb
    .getAll()
    .filter((c) => c.card_type !== "Legend")
    .filter((c) => validateNewCard(deck, c) === true)

  if (deck.total === MAX_DECK_SIZE)
    return <Fallback>You&apos;ve reached max deck size.</Fallback>

  if (!availableCards.length)
    return (
      <Fallback>
        There are no more cards that could fit in your deck. Wait for more
        reveals!
      </Fallback>
    )
  return availableCards.map((c) => (
    <AddToDeckButton key={c.id} card={c}>
      <GameCard src={c.image_url} alt={c.name} />
    </AddToDeckButton>
  ))
}
