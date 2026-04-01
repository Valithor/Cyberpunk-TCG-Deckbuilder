import { cn } from "@/lib/utils"
import Image from "next/image"
import React from "react"

export function GameCard({
  className,
  ...props
}: React.ComponentProps<typeof Image>) {
  return (
    <Image
      className={cn("block", className)}
      width={745}
      height={1040}
      {...props}
    />
  )
}

export function CardList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap justify-center gap-4 py-10", className)}
      {...props}
    />
  )
}

