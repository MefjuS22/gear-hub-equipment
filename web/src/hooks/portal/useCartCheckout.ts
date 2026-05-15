import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import {
  getApiEquipmentQueryKey,
  usePostApiOrderCreateorder,
} from "../../api/generated/react-query";
import {
  orderCheckoutFormSchema,
  type OrderCheckoutFormValues,
} from "../../lib/formSchemas";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { getAccessToken } from "../../store/authSessionStore";
import { useCart } from "../../store/portalCartStore";

export function useCartCheckout() {
  const { enqueueSnackbar } = useSnackbar();
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
      companyName: "",
      contactPerson: "",
      rentalStart: new Date().toISOString().slice(0, 10),
      rentalEnd: tomorrow,
    },
  });

  const rentalStart =
    useWatch({ control: form.control, name: "rentalStart" }) ?? "";
  const rentalEnd =
    useWatch({ control: form.control, name: "rentalEnd" }) ?? "";

  const submit = usePostApiOrderCreateorder({
    client: gearhubApiClientOptions,
    mutation: {
      onSuccess: () => {
        clear();
        queryClient.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
        enqueueSnackbar("Order placed.", { variant: "success" });
      },
    },
  });

  const subtotal = useMemo(() => {
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(rentalEnd).getTime() - new Date(rentalStart).getTime()) /
          (1000 * 60 * 60 * 24),
      ) || 1,
    );
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
    submit.mutate({
      data: {
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
  };
}
