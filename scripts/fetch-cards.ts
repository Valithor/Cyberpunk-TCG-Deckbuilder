// scripts/fetch-cards.ts
import fs from "node:fs/promises";

const URL = "https://api.netdeck.gg/api/cards/cyberpunk?limit=500&offset=0";

async function main() {
  const res = await fetch(URL);
  const data = await res.json();

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(
    "data/cards.json",
    JSON.stringify(data, null, 2)
  );
}

main();