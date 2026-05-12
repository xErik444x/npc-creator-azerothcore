import { useState, useCallback, useRef } from "react";
import { Trash2, Search, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors, useWatch, Control } from "react-hook-form";
import { VendorFormValues } from "../lib/sql-generator";
import { fetchItem, type ItemInfo } from "@/lib/item-api";

const QUALITY_COLORS: Record<number, string> = {
  0: "#9d9d9d",
  1: "#ffffff",
  2: "#1eff00",
  3: "#0070dd",
  4: "#a335ee",
  5: "#ff8000",
  6: "#e6cc80",
};

interface ItemRowProps {
  index: number;
  register: UseFormRegister<VendorFormValues>;
  control: Control<VendorFormValues>;
  onRemove: () => void;
  errors?: FieldErrors<VendorFormValues>;
}

export function ItemRow({ index, register, control, onRemove, errors }: ItemRowProps) {
  const [itemInfo, setItemInfo] = useState<ItemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lastFetchedId = useRef<number | null>(null);

  const itemId = useWatch({ control, name: `items.${index}.item` });

  const doFetch = useCallback(async (id: number) => {
    if (!id || id <= 0 || id === lastFetchedId.current) return;
    lastFetchedId.current = id;
    setLoading(true);
    setLookupError(null);
    setItemInfo(null);
    try {
      const data = await fetchItem(id);
      setItemInfo(data);
    } catch {
      setLookupError("Item not found");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLookupClick = () => {
    const id = Number(itemId);
    if (id > 0) { lastFetchedId.current = null; doFetch(id); }
  };

  const handleIdBlur = () => {
    const id = Number(itemId);
    if (id > 0) doFetch(id);
  };

  return (
    <div
      className="rounded-md border border-border bg-secondary/20 p-3 space-y-3 animate-in fade-in slide-in-from-bottom-2"
      data-testid={`item-row-${index}`}
    >
      {(itemInfo || loading || lookupError) && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-background/60 border border-border min-h-[40px]">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
          {lookupError && !loading && (
            <>
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-xs text-destructive">{lookupError}</span>
            </>
          )}
          {itemInfo && !loading && (
            <>
              <img
                src={itemInfo.iconUrl}
                alt={itemInfo.name}
                className="h-7 w-7 rounded border border-border shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold truncate block" style={{ color: QUALITY_COLORS[itemInfo.quality] ?? "#fff" }}>
                  {itemInfo.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {itemInfo.qualityName} &middot; Req. Level {itemInfo.requiredLevel}
                </span>
              </div>
              <a
                href={itemInfo.wowheadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary shrink-0"
                title="View on Wowhead"
                data-testid={`item-wowhead-link-${index}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap md:flex-nowrap items-end gap-2">
        <div className="flex-1 min-w-[130px] space-y-1">
          <Label className="text-xs text-muted-foreground">Item ID</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="e.g. 19019"
              data-testid={`input-item-id-${index}`}
              {...register(`items.${index}.item` as const, { valueAsNumber: true })}
              onBlur={handleIdBlur}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 h-9 w-9"
              title="Lookup item"
              onClick={handleLookupClick}
              data-testid={`button-lookup-item-${index}`}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          {errors?.items?.[index]?.item && (
            <p className="text-[10px] text-destructive">{errors.items[index]?.item?.message}</p>
          )}
        </div>

        <div className="flex-1 min-w-[90px] space-y-1">
          <Label className="text-xs text-muted-foreground">Max Count</Label>
          <Input type="number" placeholder="0=unlim" data-testid={`input-item-maxcount-${index}`}
            {...register(`items.${index}.maxcount` as const, { valueAsNumber: true })} />
        </div>

        <div className="flex-1 min-w-[90px] space-y-1">
          <Label className="text-xs text-muted-foreground">Incr. Time (s)</Label>
          <Input type="number" placeholder="0" data-testid={`input-item-incrtime-${index}`}
            {...register(`items.${index}.incrtime` as const, { valueAsNumber: true })} />
        </div>

        <div className="flex-1 min-w-[90px] space-y-1">
          <Label className="text-xs text-muted-foreground">Ext. Cost</Label>
          <Input type="number" placeholder="0" data-testid={`input-item-extcost-${index}`}
            {...register(`items.${index}.extendedcost` as const, { valueAsNumber: true })} />
        </div>

        <div className="flex-1 min-w-[70px] space-y-1">
          <Label className="text-xs text-muted-foreground">Slot</Label>
          <Input type="number" placeholder="-1" data-testid={`input-item-slot-${index}`}
            {...register(`items.${index}.slot` as const, { valueAsNumber: true })} />
        </div>

        <div className="shrink-0">
          <Button
            type="button" variant="ghost" size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            data-testid={`button-remove-item-${index}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
