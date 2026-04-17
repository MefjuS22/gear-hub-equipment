import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  useGetApiCustomer,
  usePostApiOrderCreateorder,
} from "../../api/generated/react-query";
import { PORTAL_CHECKOUT_STAFF_USER_ID } from "../../lib/portalConstants";
import { orderCheckoutFormSchema, type OrderCheckoutFormValues } from "../../lib/formSchemas";
import { useCart } from "../../ui/portal/cartContext";

export function useCartCheckout() {
  const { lines, clear, setQuantity, remove } = useCart();
  const queryClient = useQueryClient();

  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const form = useForm<OrderCheckoutFormValues>({
    resolver: zodResolver(orderCheckoutFormSchema),
    defaultValues: {
      customerId: 1,
      rentalStart: new Date().toISOString().slice(0, 10),
      rentalEnd: tomorrow,
    },
  });

  const rentalStart = useWatch({ control: form.control, name: "rentalStart" }) ?? "";
  const rentalEnd = useWatch({ control: form.control, name: "rentalEnd" }) ?? "";

  const customers = useGetApiCustomer({ client: gearhubApiClientOptions });

  const submit = usePostApiOrderCreateorder({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        clear();
        queryClient.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        alert("Zamówienie złożone.");
      },
      onError: (e) => alert(String((e as Error)?.message ?? e)),
    },
  });

  const subtotal = useMemo(() => {
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(rentalEnd).getTime() - new Date(rentalStart).getTime()) / (1000 * 60 * 60 * 24),
      ) || 1,
    );
    return lines.reduce((sum, l) => sum + l.dailyRate * l.quantity, 0) * days;
  }, [lines, rentalStart, rentalEnd]);

  const handleSubmitForm = form.handleSubmit((values) => {
    if (lines.length === 0) return;
    submit.mutate({
      data: {
        customerId: values.customerId,
        userId: PORTAL_CHECKOUT_STAFF_USER_ID,
        rentalStartDate: new Date(values.rentalStart).toISOString(),
        rentalEndDate: new Date(values.rentalEnd).toISOString(),
        items: lines.map((l) => ({ equipmentId: l.equipmentId, quantity: l.quantity })),
      },
    });
  });

  return {
    form,
    handleSubmitForm,
    lines,
    setQuantity,
    remove,
    customers,
    submit,
    subtotal,
  };
}
