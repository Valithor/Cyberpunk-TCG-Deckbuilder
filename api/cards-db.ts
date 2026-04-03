import cardsData from "@/data/cards.json";
import idMapData from "@/data/id-map.json";
import { CardColor, CardsReturnT } from "@/lib/api";

export const DEFAULT_RAM: Record<CardColor, number> = {
  Blue: 0,
  Green: 0,
  Red: 0,
  Yellow: 0,
};

export const cardsDb = (() => {
  const data = cardsData as CardsReturnT;
  const mapById = new Map(data.items.map((c) => [c.id, c]));
  const idMap = idMapData as Record<number, string>;

  const forwardIdMap = new Map<number, string>(
    Object.entries(idMap).map(([num, id]) => [Number(num), id])
  );

  const reverseIdMap = new Map(
    Object.entries(idMap).map(([num, id]) => [id, Number(num)])
  );

  return {
    getAll() {
      return data.items;
    },

    getById(id: string) {
      return mapById.get(id) ?? null;
    },
    getByIds(ids: string[]) {
      return data.items.filter((c) => ids.includes(c.id));
    },
    getByCustomId(id: number) {
      const realId = idMap[id];
      if (!realId) return null;
      return mapById.get(realId) ?? null;
    },
    getByCustomIds(ids: number[]) {
      return ids
        .map((numId) => {
          const realId = idMap[numId];
          if (!realId) return null;
          return mapById.get(realId) ?? null;
        })
        .filter(Boolean);
    },

    getOriginalId(customId: number) {
      return forwardIdMap.get(customId) ?? null;
    },

    getCustomId(id: string) {
      return reverseIdMap.get(id) ?? null;
    },

    getLegends() {
      return data.items.filter((c) => c.card_type === "Legend");
    },

    calculateRam(ids: string[]) {
      return data.items
        .filter((c) => c.card_type === "Legend")
        .filter((c) => ids.includes(c.id))
        .reduce(
          (p, { color, ram }) => ({ ...p, [color]: p[color] + ram }),
          DEFAULT_RAM
        );
    },
  };
})();
