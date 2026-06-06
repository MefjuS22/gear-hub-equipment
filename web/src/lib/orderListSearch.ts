import { z } from "zod";

import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./pagination";

export type OrderListSearchInput = {
  q?: string;
  orderDateFrom?: string;
  orderDateTo?: string;
  customerId?: string;
  page?: unknown;
  pageSize?: unknown;
};

export const orderListSearchSchema = z.object({
  q: z.string().catch(""),
  orderDateFrom: z.string().catch(""),
  orderDateTo: z.string().catch(""),
  customerId: z.string().catch("all"),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .catch(DEFAULT_PAGE_SIZE)
    .transform((value) =>
      PAGE_SIZE_OPTIONS.includes(value as (typeof PAGE_SIZE_OPTIONS)[number])
        ? value
        : DEFAULT_PAGE_SIZE,
    ),
});

export type OrderListSearch = z.infer<typeof orderListSearchSchema>;

export function parseOrderListSearch(
  raw: OrderListSearchInput = {},
): OrderListSearch {
  return orderListSearchSchema.parse(raw);
}

export type OrderListFilterParams = {
  Search?: string;
  OrderDateFrom?: string;
  OrderDateTo?: string;
  CustomerId?: number;
};

export function orderListFilterToApiParams(
  search: Pick<
    OrderListSearch,
    "q" | "orderDateFrom" | "orderDateTo" | "customerId"
  >,
): OrderListFilterParams {
  const trimmed = search.q.trim();
  const customerId =
    search.customerId !== "all" ? Number(search.customerId) : undefined;

  return {
    Search: trimmed || undefined,
    OrderDateFrom: search.orderDateFrom || undefined,
    OrderDateTo: search.orderDateTo || undefined,
    CustomerId:
      customerId != null && Number.isFinite(customerId) && customerId > 0
        ? customerId
        : undefined,
  };
}

export function orderListSearchToApiParams(search: OrderListSearch) {
  return {
    ...orderListFilterToApiParams(search),
    Page: search.page,
    PageSize: search.pageSize,
  };
}

export function hasActiveOrderListFilters(search: OrderListSearch): boolean {
  return (
    search.q.trim().length > 0 ||
    search.orderDateFrom.length > 0 ||
    search.orderDateTo.length > 0 ||
    search.customerId !== "all"
  );
}
