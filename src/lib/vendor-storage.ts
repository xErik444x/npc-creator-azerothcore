import { VendorFormValues } from "./sql-generator";

const STORAGE_KEY = "ac_vendor_history";

export interface SavedVendor {
  id: string;
  savedAt: number;
  data: VendorFormValues;
}

function load(): SavedVendor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedVendor[];
  } catch {
    return [];
  }
}

function save(vendors: SavedVendor[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors));
}

export function getAll(): SavedVendor[] {
  return load();
}

export function saveVendor(data: VendorFormValues): SavedVendor {
  const vendors = load();
  const entry: SavedVendor = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: Date.now(),
    data,
  };
  save([entry, ...vendors]);
  return entry;
}

export function deleteVendor(id: string): void {
  const vendors = load().filter((v) => v.id !== id);
  save(vendors);
}

export function updateVendor(id: string, data: VendorFormValues): void {
  const vendors = load().map((v) => (v.id === id ? { ...v, data, savedAt: Date.now() } : v));
  save(vendors);
}
