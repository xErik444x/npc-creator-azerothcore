import React, { useState, useMemo, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Database, Copy, Boxes, Settings2, Save, Check, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { ItemRow } from "@/components/ItemRow";
import { SqlOutput } from "@/components/SqlOutput";
import { InGameCommands } from "@/components/InGameCommands";
import { SavedVendors } from "@/components/SavedVendors";
import { useVendorStorage } from "@/hooks/useVendorStorage";
import {
  vendorFormSchema,
  duplicateFormSchema,
  npcFormSchema,
  generateCreateSql,
  generateDuplicateSql,
  generateNpcSql,
  type VendorFormValues,
  type DuplicateFormValues,
  type NpcFormValues,
} from "@/lib/sql-generator";

const NPC_FLAGS = [
  { label: "Gossip", value: 1 },
  { label: "Quest Giver", value: 2 },
  { label: "Trainer", value: 16 },
  { label: "Flight Master", value: 32 },
  { label: "Vendor", value: 128 },
];

const EXPANSION_OPTIONS = [
  { value: "0", label: "Classic" },
  { value: "1", label: "TBC" },
  { value: "2", label: "WotLK" },
  { value: "3", label: "Cataclysm" },
  { value: "4", label: "MoP" },
  { value: "5", label: "WoD" },
  { value: "6", label: "Legion" },
  { value: "7", label: "BFA" },
  { value: "8", label: "Shadowlands" },
  { value: "9", label: "Dragonflight" },
];

const UNIT_CLASS_OPTIONS = [
  { value: "1", label: "Warrior" },
  { value: "2", label: "Paladin" },
  { value: "4", label: "Rogue" },
  { value: "8", label: "Mage" },
];

const NPC_TYPE_OPTIONS = [
  { value: "1", label: "Beast" },
  { value: "2", label: "Dragonkin" },
  { value: "3", label: "Demon" },
  { value: "4", label: "Elemental" },
  { value: "5", label: "Giant" },
  { value: "6", label: "Undead" },
  { value: "7", label: "Humanoid" },
  { value: "8", label: "Critter" },
  { value: "11", label: "Mechanical" },
  { value: "12", label: "Totem" },
];

const RANK_OPTIONS = [
  { value: "0", label: "Normal" },
  { value: "1", label: "Elite" },
  { value: "2", label: "Rare Elite" },
  { value: "3", label: "Boss" },
  { value: "4", label: "Rare" },
];

const ICON_NAME_OPTIONS = [
  { value: "__none__", label: "None" },
  { value: "Speak", label: "Speak (chat bubble)" },
  { value: "Attack", label: "Attack (swords)" },
  { value: "Buy", label: "Buy (bag)" },
  { value: "Taxi", label: "Taxi (flight)" },
  { value: "Trainer", label: "Trainer (book)" },
  { value: "Interact", label: "Interact" },
];

type ActiveTab = "create" | "duplicate" | "npc";

function SimpleSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function VendorCreator() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("create");
  const [savedConfirm, setSavedConfirm] = useState(false);
  const { saved, save: saveVendor, remove: removeVendor } = useVendorStorage();

  // ── Create Vendor form ───────────────────────────────────────────────────
  const createForm = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      entry: 900001,
      name: "New Vendor",
      subname: "Reagent Vendor",
      modelid1: 17591,
      minlevel: 80,
      maxlevel: 80,
      exp: 2,
      faction: 35,
      npcflag: 128,
      speed_walk: 1.0,
      speed_run: 1.14286,
      unit_class: 1,
      type: 7,
      rank: 0,
      items: [],
    },
    mode: "onChange",
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: createForm.control,
    name: "items",
  });

  // ── Duplicate form ───────────────────────────────────────────────────────
  const duplicateForm = useForm<DuplicateFormValues>({
    resolver: zodResolver(duplicateFormSchema),
    defaultValues: { source_entry: 10000, new_entry: 900002, new_name: "" },
    mode: "onChange",
  });

  // ── NPC Creator form ─────────────────────────────────────────────────────
  const npcForm = useForm<NpcFormValues>({
    resolver: zodResolver(npcFormSchema),
    defaultValues: {
      entry: 601017,
      name: "New NPC",
      subname: "",
      iconname: "Speak",
      scriptname: "",
      gossip_menu_id: 0,
      minlevel: 80,
      maxlevel: 80,
      exp: 2,
      faction: 35,
      npcflag: 1,
      speed_walk: 1.0,
      speed_run: 1.14286,
      unit_class: 1,
      rank: 0,
      type: 7,
      flags_extra: 2,
      display_id: 14612,
      display_scale: 1,
      model_verified_build: 12340,
      equip_item1: 0,
      equip_item2: 0,
      equip_item3: 0,
      equip_verified_build: 18019,
      mov_ground: 1,
      mov_swim: 1,
      mov_flight: 0,
      mov_rooted: 0,
      mov_chase: 0,
      mov_random: 0,
    },
    mode: "onChange",
  });

  // ── Live SQL ─────────────────────────────────────────────────────────────
  const createValues = createForm.watch();
  const duplicateValues = duplicateForm.watch();
  const npcValues = npcForm.watch();

  const generatedSql = useMemo(() => {
    if (activeTab === "create") return generateCreateSql(createValues as VendorFormValues);
    if (activeTab === "duplicate") return generateDuplicateSql(duplicateValues as DuplicateFormValues);
    return generateNpcSql(npcValues as NpcFormValues);
  }, [activeTab, createValues, duplicateValues, npcValues]);

  const currentEntry =
    activeTab === "create"
      ? createValues.entry
      : activeTab === "duplicate"
      ? duplicateValues.new_entry
      : npcValues.entry;

  const handleSave = useCallback(() => {
    saveVendor(createForm.getValues());
    setSavedConfirm(true);
    setTimeout(() => setSavedConfirm(false), 2000);
  }, [createForm, saveVendor]);

  const handleLoad = useCallback(
    (data: VendorFormValues) => {
      createForm.reset(data);
      setActiveTab("create");
    },
    [createForm],
  );

  // NPC flag toggles for vendor form
  const handleNpcFlagToggle = (flagValue: number, checked: boolean) => {
    const cur = createValues.npcflag || 0;
    createForm.setValue("npcflag", checked ? cur | flagValue : cur & ~flagValue, { shouldValidate: true });
  };

  // NPC flag toggles for npc form
  const handleNpcFormFlagToggle = (flagValue: number, checked: boolean) => {
    const cur = npcValues.npcflag || 0;
    npcForm.setValue("npcflag", checked ? cur | flagValue : cur & ~flagValue, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container max-w-6xl py-8 space-y-8 mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight">AzerothCore Vendor Creator</h1>
            <p className="text-muted-foreground mt-1">Generate complete SQL for custom WoW NPCs instantly.</p>
          </div>
          {activeTab === "create" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={handleSave}
              data-testid="button-save-vendor"
            >
              {savedConfirm ? (
                <><Check className="h-4 w-4 text-green-500" /> Saved!</>
              ) : (
                <><Save className="h-4 w-4" /> Save Vendor</>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Main Form */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ActiveTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="create">Create Vendor</TabsTrigger>
                <TabsTrigger value="npc">Create NPC</TabsTrigger>
                <TabsTrigger value="duplicate">Duplicate</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ── CREATE VENDOR ── */}
                  <TabsContent value="create" className="m-0 space-y-6 outline-none">
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                          <Settings2 className="h-5 w-5 text-primary" />
                          <CardTitle>Creature Template</CardTitle>
                        </div>
                        <CardDescription>Configure the base NPC properties and appearance.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="entry">Entry ID</Label>
                            <Input id="entry" type="number" {...createForm.register("entry", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="modelid1">Display ID <span className="text-muted-foreground font-normal text-xs">(creature_template_model)</span></Label>
                            <Input id="modelid1" type="number" placeholder="e.g. 17591" {...createForm.register("modelid1", { valueAsNumber: true })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" {...createForm.register("name")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subname">Subname / Title</Label>
                            <Input id="subname" {...createForm.register("subname")} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Min Level</Label>
                            <Input type="number" {...createForm.register("minlevel", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Level</Label>
                            <Input type="number" {...createForm.register("maxlevel", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Faction</Label>
                            <Input type="number" {...createForm.register("faction", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Expansion</Label>
                            <Controller
                              control={createForm.control}
                              name="exp"
                              render={({ field }) => (
                                <SimpleSelect
                                  value={field.value?.toString()}
                                  onChange={(v) => field.onChange(parseInt(v, 10))}
                                  options={EXPANSION_OPTIONS}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Unit Class</Label>
                            <Controller control={createForm.control} name="unit_class" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={UNIT_CLASS_OPTIONS} />
                            )} />
                          </div>
                          <div className="space-y-2">
                            <Label>NPC Type</Label>
                            <Controller control={createForm.control} name="type" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={NPC_TYPE_OPTIONS} />
                            )} />
                          </div>
                          <div className="space-y-2">
                            <Label>Rank</Label>
                            <Controller control={createForm.control} name="rank" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={RANK_OPTIONS} />
                            )} />
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>NPC Flags</Label>
                            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-primary">Value: {createValues.npcflag || 0}</span>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {NPC_FLAGS.map((flag) => {
                              const isChecked = ((createValues.npcflag || 0) & flag.value) !== 0;
                              return (
                                <div key={flag.value} className="flex items-center space-x-2">
                                  <Checkbox id={`flag-${flag.value}`} checked={isChecked} onCheckedChange={(c) => handleNpcFlagToggle(flag.value, c as boolean)} />
                                  <Label htmlFor={`flag-${flag.value}`} className="font-normal cursor-pointer">{flag.label}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-4 flex flex-row items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-primary" />
                            <CardTitle>Vendor Inventory</CardTitle>
                          </div>
                          <CardDescription className="mt-1">Items sold by this vendor.</CardDescription>
                        </div>
                        <Button type="button" size="sm" variant="outline"
                          onClick={() => appendItem({ id: Math.random().toString(), item: 0, maxcount: 0, incrtime: 0, extendedcost: 0, slot: -1 })}
                          className="gap-1.5">
                          <Plus className="h-4 w-4" /> Add Item
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {itemFields.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-lg bg-secondary/10">
                            No items added yet. Click "Add Item" to build inventory.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {itemFields.map((field, index) => (
                              <ItemRow key={field.id} index={index} register={createForm.register} control={createForm.control} onRemove={() => removeItem(index)} errors={createForm.formState.errors} />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ── CREATE NPC ── */}
                  <TabsContent value="npc" className="m-0 space-y-6 outline-none">

                    {/* Identity */}
                    <Card>
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          <CardTitle>NPC Identity</CardTitle>
                        </div>
                        <CardDescription>Basic creature_template fields.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Creature ID (entry)</Label>
                            <Input type="number" {...npcForm.register("entry", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Gossip Menu ID</Label>
                            <Input type="number" {...npcForm.register("gossip_menu_id", { valueAsNumber: true })} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input {...npcForm.register("name")} />
                          </div>
                          <div className="space-y-2">
                            <Label>Subname / Title</Label>
                            <Input placeholder="(leave blank for none)" {...npcForm.register("subname")} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Script Name</Label>
                            <Input placeholder="e.g. buff_npc" {...npcForm.register("scriptname")} />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon Name</Label>
                            <Controller control={npcForm.control} name="iconname" render={({ field }) => (
                              <SimpleSelect value={field.value ?? ""} onChange={field.onChange} options={ICON_NAME_OPTIONS} />
                            )} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Min Level</Label>
                            <Input type="number" {...npcForm.register("minlevel", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Level</Label>
                            <Input type="number" {...npcForm.register("maxlevel", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Faction</Label>
                            <Input type="number" {...npcForm.register("faction", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Expansion</Label>
                            <Controller control={npcForm.control} name="exp" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={EXPANSION_OPTIONS} />
                            )} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Unit Class</Label>
                            <Controller control={npcForm.control} name="unit_class" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={UNIT_CLASS_OPTIONS} />
                            )} />
                          </div>
                          <div className="space-y-2">
                            <Label>NPC Type</Label>
                            <Controller control={npcForm.control} name="type" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={NPC_TYPE_OPTIONS} />
                            )} />
                          </div>
                          <div className="space-y-2">
                            <Label>Rank</Label>
                            <Controller control={npcForm.control} name="rank" render={({ field }) => (
                              <SimpleSelect value={field.value?.toString()} onChange={(v) => field.onChange(parseInt(v, 10))} options={RANK_OPTIONS} />
                            )} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>flags_extra</Label>
                            <Input type="number" {...npcForm.register("flags_extra", { valueAsNumber: true })} />
                            <p className="text-xs text-muted-foreground">2 = no XP, 128 = no loot. Sum for multiple.</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label>NPC Flags</Label>
                            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-primary">Value: {npcValues.npcflag || 0}</span>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {NPC_FLAGS.map((flag) => {
                              const isChecked = ((npcValues.npcflag || 0) & flag.value) !== 0;
                              return (
                                <div key={flag.value} className="flex items-center space-x-2">
                                  <Checkbox id={`npc-flag-${flag.value}`} checked={isChecked} onCheckedChange={(c) => handleNpcFormFlagToggle(flag.value, c as boolean)} />
                                  <Label htmlFor={`npc-flag-${flag.value}`} className="font-normal cursor-pointer">{flag.label}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Appearance <span className="text-muted-foreground font-normal text-xs">(creature_template_model)</span></CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Display ID</Label>
                            <Input type="number" placeholder="e.g. 14612" {...npcForm.register("display_id", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Display Scale</Label>
                            <Input type="number" step="0.1" {...npcForm.register("display_scale", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>VerifiedBuild</Label>
                            <Input type="number" {...npcForm.register("model_verified_build", { valueAsNumber: true })} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Equipment */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Equipment <span className="text-muted-foreground font-normal text-xs">(creature_equip_template)</span></CardTitle>
                        <CardDescription>Item IDs for weapon/shield slots. Use 0 for empty.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>ItemID1 (Main Hand)</Label>
                            <Input type="number" placeholder="0" {...npcForm.register("equip_item1", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>ItemID2 (Off Hand)</Label>
                            <Input type="number" placeholder="0" {...npcForm.register("equip_item2", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>ItemID3 (Ranged)</Label>
                            <Input type="number" placeholder="0" {...npcForm.register("equip_item3", { valueAsNumber: true })} />
                          </div>
                          <div className="space-y-2">
                            <Label>VerifiedBuild</Label>
                            <Input type="number" {...npcForm.register("equip_verified_build", { valueAsNumber: true })} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Movement */}
                    <Card>
                      <CardHeader className="pb-4">
                        <CardTitle className="text-base">Movement <span className="text-muted-foreground font-normal text-xs">(creature_template_movement)</span></CardTitle>
                        <CardDescription>Use 1 = enabled, 0 = disabled for each flag.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                          {(
                            [
                              { name: "mov_ground", label: "Ground" },
                              { name: "mov_swim", label: "Swim" },
                              { name: "mov_flight", label: "Flight" },
                              { name: "mov_rooted", label: "Rooted" },
                              { name: "mov_chase", label: "Chase" },
                              { name: "mov_random", label: "Random" },
                            ] as const
                          ).map(({ name, label }) => (
                            <div key={name} className="space-y-2">
                              <Label>{label}</Label>
                              <Input type="number" min={0} max={1} {...npcForm.register(name, { valueAsNumber: true })} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ── DUPLICATE ── */}
                  <TabsContent value="duplicate" className="m-0 space-y-6 outline-none">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Copy className="h-5 w-5 text-primary" />
                          <CardTitle>Duplicate Vendor</CardTitle>
                        </div>
                        <CardDescription>
                          Generates SQL to copy an existing vendor template to a new entry without affecting the original.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Source Entry ID</Label>
                            <Input type="number" {...duplicateForm.register("source_entry", { valueAsNumber: true })} />
                            <p className="text-xs text-muted-foreground">The vendor you want to copy.</p>
                          </div>
                          <div className="space-y-2">
                            <Label>New Entry ID</Label>
                            <Input type="number" {...duplicateForm.register("new_entry", { valueAsNumber: true })} />
                            <p className="text-xs text-muted-foreground">The ID for your new copied vendor.</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-2 max-w-md">
                          <Label>New Name (Optional)</Label>
                          <Input placeholder="Leave blank to keep original name" {...duplicateForm.register("new_name")} />
                        </div>
                        <div className="bg-primary/10 text-primary-foreground/80 p-4 rounded-md text-sm border border-primary/20">
                          <span className="font-semibold text-primary block mb-1">Note on Duplication:</span>
                          This will duplicate both the <code className="bg-background/50 px-1 rounded">creature_template</code> properties and all <code className="bg-background/50 px-1 rounded">npc_vendor</code> inventory rows automatically in SQL.
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6 sticky top-8">
            <Card className="border-primary/20 bg-card overflow-hidden">
              <div className="bg-secondary/40 p-4 border-b border-border flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold leading-none tracking-tight">Active SQL Summary</h3>
                  <div className="text-xs text-muted-foreground">
                    {activeTab === "create" && (
                      <>Vendor: <span className="text-primary">{createValues.name}</span> | Entry: {createValues.entry} | {createValues.items?.length || 0} items</>
                    )}
                    {activeTab === "npc" && (
                      <>NPC: <span className="text-primary">{npcValues.name}</span> | Entry: {npcValues.entry}</>
                    )}
                    {activeTab === "duplicate" && (
                      <>Duplicating: {duplicateValues.source_entry} → <span className="text-primary">{duplicateValues.new_entry}</span></>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-0">
                <SqlOutput sql={generatedSql} />
              </div>
            </Card>

            <InGameCommands entry={currentEntry || 0} items={activeTab === "create" ? createValues.items : []} />

            <SavedVendors saved={saved} onLoad={handleLoad} onDelete={removeVendor} />
          </div>

        </div>
      </div>
    </div>
  );
}
