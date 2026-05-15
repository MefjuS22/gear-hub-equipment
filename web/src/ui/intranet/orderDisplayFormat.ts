import dayjs from "dayjs";
import type { RentalOrderListDto } from "../../api/generated/types";
import { formatUsd } from "../../lib/formatCurrency";

export function formatOrderDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return d.isValid() ? d.format("MMM D, YYYY HH:mm") : "—";
}

export function formatOrderLinesSummary(order: RentalOrderListDto) {
  const items = order.items ?? [];
  if (items.length === 0) return "—";
  return items
    .map((line) => {
      const q = line.quantity ?? 0;
      const name = line.equipmentName ?? `#${line.equipmentId}`;
      const price = line.unitPrice != null ? formatUsd(line.unitPrice) : "—";
      return `${q}× ${name} @ ${price}`;
    })
    .join(" · ");
}
