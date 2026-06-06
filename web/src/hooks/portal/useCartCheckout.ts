import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import type { RentalOrder } from "../../api/generated/types";
import {
  getApiCustomerMineQueryKey,
  getApiEquipmentQueryKey,
  useGetApiCustomerMine,
  usePostApiOrderCreateorder,
} from "../../api/generated/react-query";
import {
  orderCheckoutFormSchema,
  type OrderCheckoutFormValues,
} from "../../lib/formSchemas";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { countRentalPeriodDays } from "../../lib/rentalPeriodDays";
import { getAccessToken } from "../../store/authSessionStore";
import type { CartLine } from "../../store/portalCartStore";
import { useCart } from "../../store/portalCartStore";

export type PortalLastOrderSummary = {
  order: RentalOrder;
  lines: CartLine[];
  companyName: string;
  contactPerson: string;
  rentalStart: string;
  rentalEnd: string;
};

export function useCartCheckout() {
  const { enqueueSnackbar } = useSnackbar();
  const { lines, clear, setQuantity, remove } = useCart();
  const queryClient = useQueryClient();
  const [lastPlacedOrderSummary, setLastPlacedOrderSummary] =
    useState<PortalLastOrderSummary | null>(null);
  const pendingCheckoutRef = useRef<{
    lines: CartLine[];
    values: OrderCheckoutFormValues;
  } | null>(null);

  const dismissLastPlacedOrderSummary = useCallback(() => {
    setLastPlacedOrderSummary(null);
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const form = useForm<OrderCheckoutFormValues>({
    resolver: zodResolver(orderCheckoutFormSchema),
    defaultValues: {
      customerId: undefined,
      companyName: "",
      contactPerson: "",
      rentalStart: new Date().toISOString().slice(0, 10),
      rentalEnd: tomorrow,
    },
  });

  const checkoutCompanies = useGetApiCustomerMine({
    client: gearhubApiClientOptions,
    query: { enabled: Boolean(getAccessToken()) },
  });

  const rentalStart =
    useWatch({ control: form.control, name: "rentalStart" }) ?? "";
  const rentalEnd =
    useWatch({ control: form.control, name: "rentalEnd" }) ?? "";

  const submit = usePostApiOrderCreateorder({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: (order) => {
        const pending = pendingCheckoutRef.current;
        pendingCheckoutRef.current = null;
        clear();
        queryClient.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        queryClient.invalidateQueries({
          queryKey: getApiCustomerMineQueryKey(),
        });
        enqueueSnackbar("Order placed.", { variant: "success" });
        const d = new Date();
        const tmr = new Date(d);
        tmr.setDate(tmr.getDate() + 1);
        form.reset({
          customerId: undefined,
          companyName: "",
          contactPerson: "",
          rentalStart: d.toISOString().slice(0, 10),
          rentalEnd: tmr.toISOString().slice(0, 10),
        });
        if (pending && order) {
          setLastPlacedOrderSummary({
            order,
            lines: pending.lines,
            companyName: pending.values.companyName.trim(),
            contactPerson: pending.values.contactPerson.trim(),
            rentalStart: pending.values.rentalStart,
            rentalEnd: pending.values.rentalEnd,
          });
        }
      },
      onError: () => {
        pendingCheckoutRef.current = null;
      },
    },
  });

  const subtotal = useMemo(() => {
    const days = countRentalPeriodDays(rentalStart, rentalEnd);
    return lines.reduce((sum, l) => sum + l.dailyRate * l.quantity, 0) * days;
  }, [lines, rentalStart, rentalEnd]);

  const orderSubmitError = useMemo(() => {
    if (!submit.error) return null;
    return formatApiErrorForDisplay(parseApiError(submit.error));
  }, [submit.error]);

  const handleSubmitForm = form.handleSubmit((values) => {
    if (lines.length === 0) return;
    if (!getAccessToken()) {
      enqueueSnackbar("Sign in to place an order.", { variant: "warning" });
      return;
    }
    pendingCheckoutRef.current = {
      lines: lines.map((l) => ({ ...l })),
      values,
    };
    submit.mutate({
      data: values.customerId
        ? {
            customerId: values.customerId,
            rentalStartDate: new Date(values.rentalStart).toISOString(),
            rentalEndDate: new Date(values.rentalEnd).toISOString(),
            items: lines.map((l) => ({
              equipmentId: l.equipmentId,
              quantity: l.quantity,
            })),
          }
        : {
            companyName: values.companyName.trim(),
            contactPerson: values.contactPerson.trim(),
            rentalStartDate: new Date(values.rentalStart).toISOString(),
            rentalEndDate: new Date(values.rentalEnd).toISOString(),
            items: lines.map((l) => ({
              equipmentId: l.equipmentId,
              quantity: l.quantity,
            })),
          },
    });
  });

  return {
    form,
    handleSubmitForm,
    lines,
    setQuantity,
    remove,
    submit,
    subtotal,
    orderSubmitError,
    lastPlacedOrderSummary,
    dismissLastPlacedOrderSummary,
    checkoutCompanies: checkoutCompanies.data ?? [],
  };
}
