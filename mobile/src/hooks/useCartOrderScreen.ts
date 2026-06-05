import { useMemo, useState } from "react";
import { useApiErrorMessage } from "./useApiErrorMessage";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

import { generatedClientConfig } from "../api/generatedConfig";
import { usePostApiOrderCreateorder } from "../api/generated/react-query";
import type { PostApiOrderCreateorderMutationRequest } from "../api/generated/types";
import { handleApiError } from "../lib/apiError";
import { ShopStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";
import { useAuth } from "../providers/AuthProvider";
import { getAccessToken } from "../store/authSessionStore";
import { useCartStore } from "../store/useCartStore";
import { formatDateForApi, formatDateForDisplay, parseDateInput } from "../utils/date";

type Props = NativeStackScreenProps<ShopStackParamList, "CartOrder">;

const orderFormSchema = z
  .object({
    companyName: z.string().min(1, "Company or organization name is required"),
    contactPerson: z.string().min(1, "Contact person is required"),
    rentalStartDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format for start date."),
    rentalEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format for end date."),
  })
  .superRefine((value, context) => {
    if (value.rentalEndDate < value.rentalStartDate) {
      context.addIssue({
        code: "custom",
        path: ["rentalEndDate"],
        message: "Rental end date must be after start date.",
      });
    }
  });

export type OrderFormValues = z.infer<typeof orderFormSchema>;

export const useCartOrderScreen = ({ navigation, route }: Pick<Props, "navigation" | "route">) => {
  const { showError, showInfo } = useAppToast();
  const { isAuthenticated } = useAuth();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const initialRentalStartDate = route.params?.initialRentalStartDate ?? "2026-04-17";
  const initialRentalEndDate = route.params?.initialRentalEndDate ?? "2026-04-20";
  const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: parseDateInput(initialRentalStartDate),
    endDate: parseDateInput(initialRentalEndDate),
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      rentalStartDate: initialRentalStartDate,
      rentalEndDate: initialRentalEndDate,
    },
  });

  const {
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = form;

  const createOrderMutation = usePostApiOrderCreateorder({
    client: generatedClientConfig,
  });
  const orderSubmitError = useApiErrorMessage(createOrderMutation.error);

  const rentalStartDate = watch("rentalStartDate");
  const rentalEndDate = watch("rentalEndDate");

  const subtotal = useMemo(
    () =>
      items.reduce((accumulator, item) => {
        return accumulator + item.dailyRate * item.quantity;
      }, 0),
    [items],
  );

  const onConfirmOrder = async (values: OrderFormValues) => {
    if (items.length === 0) {
      showError({
        message: "Your cart is empty.",
      });
      return;
    }

    if (!getAccessToken()) {
      showInfo({
        message: "Sign in to place an order.",
      });
      navigation.dispatch(
        CommonActions.navigate({
          name: "Login",
          params: { redirectTo: "cart" },
        }),
      );
      return;
    }

    const payload: PostApiOrderCreateorderMutationRequest = {
      companyName: values.companyName.trim(),
      contactPerson: values.contactPerson.trim(),
      rentalStartDate: new Date(values.rentalStartDate).toISOString(),
      rentalEndDate: new Date(values.rentalEndDate).toISOString(),
      items: items.map((item) => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
      })),
    };

    try {
      const itemsCount = items.reduce((total, item) => total + item.quantity, 0);
      await createOrderMutation.mutateAsync({ data: payload });
      clearCart();
      navigation.replace("OrderConfirmation", {
        companyName: values.companyName.trim(),
        contactPerson: values.contactPerson.trim(),
        rentalStartDate: values.rentalStartDate,
        rentalEndDate: values.rentalEndDate,
        itemsCount,
        subtotalPerDay: subtotal,
      });
    } catch (err) {
      handleApiError(err, { setError });
    }
  };

  const dateRangeLabel = `${formatDateForDisplay(rentalStartDate)} - ${formatDateForDisplay(
    rentalEndDate,
  )}`;

  const onOpenDateRangePicker = () => {
    setIsDateRangePickerVisible(true);
  };

  const onDismissDateRangePicker = () => {
    setIsDateRangePickerVisible(false);
  };

  const onConfirmDateRange = (startDate?: Date, endDate?: Date) => {
    setIsDateRangePickerVisible(false);
    setDateRange({ startDate, endDate });

    if (startDate) {
      setValue("rentalStartDate", formatDateForApi(startDate), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (endDate) {
      setValue("rentalEndDate", formatDateForApi(endDate), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onNavigateLogin = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "Login",
        params: { redirectTo: "cart" },
      }),
    );
  };

  const onNavigateRegister = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "Register",
        params: { redirectTo: "cart" },
      }),
    );
  };

  return {
    form,
    items,
    updateQuantity,
    removeFromCart,
    isAuthenticated,
    errors,
    subtotal,
    dateRange,
    dateRangeLabel,
    isDateRangePickerVisible,
    createOrderMutation,
    orderSubmitError,
    onOpenDateRangePicker,
    onDismissDateRangePicker,
    onConfirmDateRange,
    onConfirmOrderPress: handleSubmit(onConfirmOrder),
    onNavigateLogin,
    onNavigateRegister,
  };
};
