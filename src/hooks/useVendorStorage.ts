import { useState, useCallback, useEffect } from "react";
import {
  getAll,
  saveVendor,
  deleteVendor,
  updateVendor,
  type SavedVendor,
} from "@/lib/vendor-storage";
import { VendorFormValues } from "@/lib/sql-generator";

export function useVendorStorage() {
  const [saved, setSaved] = useState<SavedVendor[]>([]);

  useEffect(() => {
    setSaved(getAll());
  }, []);

  const save = useCallback((data: VendorFormValues): SavedVendor => {
    const entry = saveVendor(data);
    setSaved(getAll());
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    deleteVendor(id);
    setSaved(getAll());
  }, []);

  const update = useCallback((id: string, data: VendorFormValues) => {
    updateVendor(id, data);
    setSaved(getAll());
  }, []);

  return { saved, save, remove, update };
}
