"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { useHasHover } from "@/hooks/useHasHover"

const TooltipClickCtx = React.createContext<
  React.MouseEventHandler<HTMLButtonElement> | undefined
>(undefined)

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  clickable,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  clickable?: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasHover = useHasHover()
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      setIsOpen((p) => !p)
    },
    []
  )
  const canClick = !hasHover && clickable

  return (
    <TooltipClickCtx.Provider value={canClick ? handleClick : undefined}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        open={canClick ? isOpen : undefined}
        onOpenChange={canClick ? setIsOpen : undefined}
        {...props}
      />
    </TooltipClickCtx.Provider>
  )
}
//FIX: pass onCLick handle
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const handleClick = React.useContext(TooltipClickCtx)
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      onClick={handleClick}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  hideArrow = false,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  hideArrow?: boolean
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-none px-3 py-1.5 text-xs bg-foreground text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-none data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {hideArrow ? null : (
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-none bg-foreground fill-foreground" />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
