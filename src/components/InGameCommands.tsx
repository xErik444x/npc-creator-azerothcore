import { useState } from "react";
import { Copy, TerminalSquare, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VendorItem {
  item: number;
  maxcount: number;
  incrtime: number;
  extendedcost: number;
  slot: number;
}

interface InGameCommandsProps {
  entry: number;
  items?: VendorItem[];
}

function CmdLine({ cmd, comment }: { cmd: string; comment: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-start justify-between gap-2 group py-0.5">
      <div className="min-w-0">
        <span className="font-mono text-sm text-green-400">{cmd}</span>
        <span className="text-xs text-muted-foreground ml-3">{comment}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        onClick={copy}
        title="Copy command"
        data-testid={`copy-cmd-${cmd.replace(/\s+/g, "-").slice(0, 30)}`}
      >
        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5 mt-3 first:mt-0">
        {title}
      </p>
      {children}
    </div>
  );
}

export function InGameCommands({ entry, items = [] }: InGameCommandsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allCopied, setAllCopied] = useState(false);

  const validItems = items.filter((it) => it.item > 0);

  const allCommandsText = [
    "-- Find NPC by name",
    ".lookup creature <npc name>",
    "",
    "-- Spawn your NPC at your current position",
    `.npc add ${entry}`,
    "",
    "-- Inspect the targeted NPC",
    ".npc info",
    "",
    "-- Find items by name to get their IDs",
    ".lookup item <item name>",
    "",
    ...(validItems.length > 0
      ? [
          "-- Add items to the targeted vendor",
          ...validItems.map((it) => {
            const parts = [`.npc vendoradditem ${it.item}`];
            if (it.maxcount !== 0) parts.push(it.maxcount.toString());
            if (it.maxcount !== 0 && it.incrtime !== 0) parts.push(it.incrtime.toString());
            if (it.extendedcost !== 0) {
              if (it.maxcount === 0) parts.push("0", "0");
              parts.push(it.extendedcost.toString());
            }
            return parts.join(" ");
          }),
          "",
          "-- Remove an item from the targeted vendor",
          ".npc vendorremoveitem <item ID>",
          "",
        ]
      : [
          "-- Add an item to the targeted vendor",
          ".npc vendoradditem <item ID> [maxcount] [incrtime] [extendedcost]",
          "",
          "-- Remove an item from the targeted vendor",
          ".npc vendorremoveitem <item ID>",
          "",
        ]),
    "-- Delete the targeted NPC from the world",
    ".npc delete",
  ].join("\n");

  const copyAll = () => {
    navigator.clipboard.writeText(allCommandsText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="bg-card">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto font-normal rounded-none rounded-t-md"
            data-testid="toggle-ingame-commands"
          >
            <div className="flex items-center gap-2">
              <TerminalSquare className="h-5 w-5 text-primary" />
              <span className="text-base font-medium">In-Game Commands</span>
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
          <CardContent className="pt-0 pb-4 px-4 space-y-1">
            <div className="relative rounded-md bg-black/80 border border-border p-4 mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={copyAll}
                data-testid="copy-all-commands"
              >
                {allCopied ? (
                  <><Check className="h-3 w-3 text-green-500" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy all</>
                )}
              </Button>

              <div className="pr-20 space-y-3">
                <Section title="Search">
                  <CmdLine cmd=".lookup creature <npc name>" comment="find NPC entry ID by name" />
                  <CmdLine cmd=".lookup item <item name>" comment="find item ID by name" />
                </Section>

                <Section title="Spawning">
                  <CmdLine cmd={`.npc add ${entry}`} comment="spawn this NPC at your position" />
                  <CmdLine cmd=".npc info" comment="inspect the targeted NPC" />
                  <CmdLine cmd=".npc delete" comment="remove the targeted NPC from the world" />
                </Section>

                <Section title="Vendor inventory (target NPC first)">
                  {validItems.length > 0 ? (
                    validItems.map((it) => {
                      const parts = [`.npc vendoradditem ${it.item}`];
                      if (it.maxcount !== 0) parts.push(it.maxcount.toString());
                      if (it.maxcount !== 0 && it.incrtime !== 0) parts.push(it.incrtime.toString());
                      if (it.extendedcost !== 0) {
                        if (it.maxcount === 0) parts.push("0", "0");
                        parts.push(it.extendedcost.toString());
                      }
                      return (
                        <CmdLine
                          key={it.item}
                          cmd={parts.join(" ")}
                          comment={`add item ${it.item}`}
                        />
                      );
                    })
                  ) : (
                    <CmdLine
                      cmd=".npc vendoradditem <item ID> [maxcount] [incrtime] [extendedcost]"
                      comment="add item to vendor"
                    />
                  )}
                  <CmdLine cmd=".npc vendorremoveitem <item ID>" comment="remove item from vendor" />
                </Section>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground pt-1">
              Hover a command to copy it individually. Requires GM level access in-game.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
