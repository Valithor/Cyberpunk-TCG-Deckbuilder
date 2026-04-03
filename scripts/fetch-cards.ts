import { CardsReturnT, CardT } from "@/lib/api";
import fs from "node:fs/promises";
import path from "node:path";

const URL = "https://api.netdeck.gg/api/cards/cyberpunk?limit=500&offset=0";

const ID_MAP_PATH = "data/id-map.json";

async function main() {
  const res = await fetch(URL);
  const data = (await res.json()) as CardsReturnT;

  await fs.mkdir("data", { recursive: true });
  await fs.mkdir("public/cards", { recursive: true });

  const idMap = await loadIdMap();

  let nextId = getNextId(idMap);

  for (const item of data.items) {
    const fileName = `${item.id}.png`;
    const filePath = path.join("public/cards", fileName);

    await download(item.image_url, filePath);
    item.image_url = `cards/${fileName}`;

    // check if already mapped
    const exists = Object.values(idMap).includes(item.id);

    if (!exists) {
      idMap[nextId] = item.id;
      nextId++;
    }
  }

  await fs.writeFile("data/cards.json", JSON.stringify(data, null, 2));
  await fs.writeFile(ID_MAP_PATH, JSON.stringify(idMap, null, 2));
}

async function loadIdMap(): Promise<Record<number, string>> {
  try {
    const file = await fs.readFile(ID_MAP_PATH, "utf-8");
    return JSON.parse(file) as Promise<Record<number, string>>;
  } catch {
    return {};
  }
}

function getNextId(map: Record<number, string>) {
  const keys = Object.keys(map).map(Number);
  return keys.length ? Math.max(...keys) + 1 : 1;
}

async function download(url: string, filePath: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(filePath, buffer);
}

main();
