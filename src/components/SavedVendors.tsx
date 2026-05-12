import { useState } from "react";
import { Archive, ChevronDown, ChevronUp, Trash2, FolderOpen, Copy, Check, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { type SavedVendor } from "@/lib/vendor-storage";
import { generateCreateSql, type VendorFormValues } from "@/lib/sql-generator";

interface SavedVendorsProps {
  saved: SavedVendor[];
  onLoad: (data: VendorFormValues) => void;
  onDelete: (id: string) => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function VendorCard({
  vendor,
  onLoad,
  onDelete,
}: {
  vendor: SavedVendor;
  onLoad: (data: VendorFormValues) => void;
  onDelete: (id: string) => void;
}) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopySql = () => {
    const sql = generateCreateSql(vendor.data);
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onDelete(vendor.id);
  };

  const { data } = vendor;

  return (
    <div
      className="rounded-md border border-border bg-secondary/20 p-3 space-y-2 hover:border-primary/30 transition-colors"
      data-testid={`saved-vendor-${vendor.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate text-foreground">{data.name}</p>
          {data.subname && (
            <p className="text-[11px] text-muted-foreground truncate">{data.subname}</p>
          )}
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0 font-mono text-primary border-primary/30">
          #{data.entry}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
        <span>{data.items.filter(i => i.item > 0).length} items</span>
        <span>Lvl {data.minlevel}–{data.maxlevel}</span>
        <span>Faction {data.faction}</span>
        <span className="ml-auto">{formatDate(vendor.savedAt)}</span>
      </div>

      <div className="flex gap-1.5 pt-0.5">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs flex-1"
          onClick={() => onLoad(data)}
          data-testid={`load-vendor-${vendor.id}`}
        >
          <FolderOpen className="h-3.5 w-3.5" /> Load
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs flex-1"
          onClick={handleCopySql}
          data-testid={`copy-sql-vendor-${vendor.id}`}
        >
          {copiedSql ? (
            <><Check className="h-3.5 w-3.5 text-green-500" /> Copied</>
          ) : (
            <><Copy className="h-3.5 w-3.5" /> SQL</>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={`h-7 w-7 p-0 ${confirmDelete ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"}`}
          onClick={handleDelete}
          title={confirmDelete ? "Click again to confirm delete" : "Delete vendor"}
          data-testid={`delete-vendor-${vendor.id}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {confirmDelete && (
        <p className="text-[10px] text-destructive">Click delete again to confirm.</p>
      )}
    </div>
  );
}

export function SavedVendors({ saved, onLoad, onDelete }: SavedVendorsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto font-normal rounded-none rounded-t-md"
            data-testid="toggle-saved-vendors"
          >
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              <span className="text-base font-medium">Saved Vendors</span>
              {saved.length > 0 && (
                <Badge className="text-[10px] h-5 px-1.5 bg-primary/20 text-primary border-primary/30" variant="outline">
                  {saved.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isOpen ? (
                <>Hide <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>Show <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            {saved.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <PackageOpen className="h-8 w-8 opacity-30" />
                <p className="text-sm">No saved vendors yet.</p>
                <p className="text-xs">Click "Save Vendor" to store the current configuration.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 mt-2">
                {saved.map((v) => (
                  <VendorCard
                    key={v.id}
                    vendor={v}
                    onLoad={onLoad}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
