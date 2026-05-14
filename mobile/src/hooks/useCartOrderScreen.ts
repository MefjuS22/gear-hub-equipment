import { useEffect, useMemo, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";

import { generatedClientConfig } from "../api/generatedConfig";
import {
  useGetApiCustomer,
  usePostApiOrderCreateorder,
} from "../api/generated/react-query";
import type { PostApiOrderCreateorderMutationRequest } from "../api/generated/types";
import { orderCreateDtoSchema } from "../api/generated/zod";
import { mapApiCustomer } from "../api/mappers";
import { ShopStackParamList } from "../navigation/navigationTypes";
import { useAppToast } from "../providers/AppToastProvider";
import { useCartStore } from "../store/useCartStore";
import { Customer } from "../types";
import { formatDateForApi, formatDateForDisplay, parseDateInput } from "../utils/date";

type Props = NativeStackScreenProps<ShopStackParamList, "CartOrder">;
const CURRENT_USER_ID = 1;

const orderFormSchema = orderCreateDtoSchema
  .pick({ customerId: true, userId: true, rentalStartDate: true, rentalEndDate: true })
  .extend({
    rentalStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format for start date."),
    rentalEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format for end date."),
  })
  .superRefine((value, context) => {
    if (value.customerId == null || value.customerId <= 0) {
      context.addIssue({
        code: "custom",
        path: ["customerId"],
        message: "Customer is required.",
      });
    }
    if (value.userId == null || value.userId <= 0) {
      context.addIssue({
        code: "custom",
        path: ["userId"],
        message: "User is required.",
      });
    }
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
  const { showError } = useAppToast();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const initialRentalStartDate = route.params?.initialRentalStartDate ?? "2026-04-17";
  const initialRentalEndDate = route.params?.initialRentalEndDate ?? "2026-04-20";
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: parseDateInput(initialRentalStartDate),
    endDate: parseDateInput(initialRentalEndDate),
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: undefined,
      userId: CURRENT_USER_ID,
      rentalStartDate: initialRentalStartDate,
      rentalEndDate: initialRentalEndDate,
    },
  });

  const customersQuery = useGetApiCustomer({
    client: generatedClientConfig,
    query: {
      select: (data) => data.map(mapApiCustomer),
    },
  });

  const createOrderMutation = usePostApiOrderCreateorder({
    client: generatedClientConfig,
  });

  const customers: Customer[] = useMemo(() => customersQuery.data ?? [], [customersQuery.data]);
  const selectedCustomerId = watch("customerId");
  const rentalStartDate = watch("rentalStartDate");
  const rentalEndDate = watch("rentalEndDate");

  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setValue("customerId", customers[0].id);
    }
  }, [customers, selectedCustomerId, setValue]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );

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

    const payload: PostApiOrderCreateorderMutationRequest = {
      customerId: values.customerId,
      userId: values.userId,
      rentalStartDate: values.rentalStartDate,
      rentalEndDate: values.rentalEndDate,
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
        customerName: selectedCustomer?.companyName ?? "Unknown customer",
        rentalStartDate: values.rentalStartDate,
        rentalEndDate: values.rentalEndDate,
        itemsCount,
        subtotalPerDay: subtotal,
      });
    } catch {
      showError({
        message: "Unable to post order. Please check API connectivity.",
      });
    }
  };

  const dateRangeLabel = `${formatDateForDisplay(rentalStartDate)} - ${formatDateForDisplay(
    rentalEndDate,
  )}`;

  const onOpenCustomerMenu = () => {
    setCustomerMenuVisible(true);
  };

  const onDismissCustomerMenu = () => {
    setCustomerMenuVisible(false);
  };

  const onSelectCustomer = (customerId: number) => {
    setValue("customerId", customerId, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setCustomerMenuVisible(false);
  };

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

  return {
    items,
    updateQuantity,
    removeFromCart,
    customers,
    selectedCustomer,
    customersQuery,
    errors,
    subtotal,
    dateRange,
    dateRangeLabel,
    customerMenuVisible,
    isDateRangePickerVisible,
    createOrderMutation,
    onOpenCustomerMenu,
    onDismissCustomerMenu,
    onSelectCustomer,
    onOpenDateRangePicker,
    onDismissDateRangePicker,
    onConfirmDateRange,
    onConfirmOrderPress: handleSubmit(onConfirmOrder),
  };
};
