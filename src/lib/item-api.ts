const QUALITY_NAMES: Record<number, string> = {
  0: "Poor",
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Epic",
  5: "Legendary",
  6: "Artifact",
};

export interface ItemInfo {
  id: number;
  name: string;
  quality: number;
  qualityName: string;
  iconUrl: string;
  requiredLevel: number;
  inventorySlot: number;
  wowheadUrl: string;
}

export async function fetchItem(id: number): Promise<ItemInfo> {
  const target = `https://www.wowdb.com/api/item/${id}`;
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error("Item not found");

  const text = await res.text();
  // WoWDB returns JSONP: ({...}) — strip outer parentheses
  const jsonText = text.trim().replace(/^\(/, "").replace(/\)$/, "");
  const data = JSON.parse(jsonText);

  if (!data.ID) throw new Error("Item not found");

  return {
    id: data.ID,
    name: data.Name,
    quality: data.Quality,
    qualityName: QUALITY_NAMES[data.Quality as number] ?? "Unknown",
    iconUrl: `https://wow.zamimg.com/images/wow/icons/medium/${data.Icon}.jpg`,
    requiredLevel: data.RequiredLevel,
    inventorySlot: data.InventorySlot,
    wowheadUrl: `https://www.wowhead.com/item=${data.ID}`,
  };
}
