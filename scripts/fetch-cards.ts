import { CardT } from "@/lib/api"
import fs from "node:fs/promises"
import path from "node:path"

const URL = "https://api.netdeck.gg/api/cards/cyberpunk?limit=500&offset=0"

async function main() {
  const res = await fetch(URL)
  const data = await res.json()

  await fs.mkdir("data", { recursive: true })
  await fs.mkdir("public/cards", { recursive: true })

  for (const item of data.items as CardT[]) {
    const fileName = `${item.id}.png`
    const filePath = path.join("public/cards", fileName)
    await download(item.image_url, filePath)
    item.image_url = `cards/${fileName}`
  }

  await fs.writeFile("data/cards.json", JSON.stringify(data, null, 2))
}

async function download(url: string, filePath: string) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  await fs.writeFile(filePath, buffer)
}

main()
