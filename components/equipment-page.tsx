"use client";

import { useState } from "react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Pill } from "@/components/ui";
import { EquipmentItem } from "@/lib/types";
import { makeId } from "@/lib/utils";

export function EquipmentPageView() {
  const { data, hydrated, saveEquipment } = useData();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  if (!hydrated) return <Card>Loading local data…</Card>;

  const updateItem = (id: string, next: Partial<EquipmentItem>) => {
    saveEquipment(data.equipment.map((item) => (item.id === id ? { ...item, ...next } : item)));
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Equipment" description="Only available equipment is used for default workout suggestions." />
      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Equipment name" />
          <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
          <Button
            onClick={() => {
              if (!name.trim()) return;
              saveEquipment([
                ...data.equipment,
                { id: makeId("equipment"), name: name.trim(), category: category.trim() || "Other", available: true },
              ]);
              setName("");
              setCategory("");
            }}
          >
            Add equipment
          </Button>
        </div>
      </Card>
      <div className="space-y-3">
        {data.equipment.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <input
                  className="border-0 bg-transparent px-0 py-0 text-lg font-semibold"
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.target.value })}
                />
                <input
                  className="mt-2 border-0 bg-transparent px-0 py-0 text-sm text-slate"
                  value={item.category}
                  onChange={(event) => updateItem(item.id, { category: event.target.value })}
                />
              </div>
              <div className="text-right">
                <Pill tone={item.available ? "good" : "warn"}>{item.available ? "Available" : "Unavailable"}</Pill>
                <button
                  className="mt-3 block text-sm font-semibold text-moss"
                  onClick={() => updateItem(item.id, { available: !item.available })}
                >
                  Mark {item.available ? "unavailable" : "available"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
