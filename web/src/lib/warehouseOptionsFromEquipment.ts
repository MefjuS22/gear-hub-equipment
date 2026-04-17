import type { EquipmentDto } from "../api/generated/types";

export type WarehouseOption = { id: number; name: string };

export function warehouseOptionsFromEquipment(items: EquipmentDto[] | undefined): WarehouseOption[] {
  const map = new Map<number, string>();
  for (const e of items ?? []) {
    const id = e.warehouseId;
    if (id == null) continue;
    const label = e.warehouseName?.trim() || `Warehouse #${id}`;
    map.set(id, label);
  }
  return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.id - b.id);
}
