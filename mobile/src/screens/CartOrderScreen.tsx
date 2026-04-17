import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Divider, Menu, Text } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { z } from "zod/v4";

import { generatedClientConfig } from "../api/generatedConfig";
import {
  useGetApiCustomer,
  usePostApiOrderCreateorder,
} from "../api/generated/react-query";
import type { PostApiOrderCreateorderMutationRequest } from "../api/generated/types";
import { orderCreateDtoSchema } from "../api/generated/zod";
import { mapApiCustomer } from "../api/mappers";
import { QuantityControl } from "../components/QuantityControl";
import { ScreenShell } from "../components/ScreenShell";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppToast } from "../providers/AppToastProvider";
import { useCartStore } from "../store/useCartStore";
import { Customer } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CartOrder">;
const CURRENT_USER_ID = 1;

const parseDateInput = (value: string) => {
  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const formatDateForApi = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForDisplay = (value: string) => {
  const parsedDate = parseDateInput(value);
  if (!parsedDate) {
    return value;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const orderFormSchema = orderCreateDtoSchema
  .pick({
    customerId: true,
    userId: true,
    rentalStartDate: true,
    rentalEndDate: true,
  })
  .extend({
    customerId: z.number().int().positive("Customer is required."),
    userId: z.number().int().positive(),
    rentalStartDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format for start date."),
    rentalEndDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format for end date."),
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

type OrderFormValues = z.infer<typeof orderFormSchema>;

export const CartOrderScreen = ({ navigation }: Props) => {
  const { showSuccess, showError } = useAppToast();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [isDateRangePickerVisible, setIsDateRangePickerVisible] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: parseDateInput("2026-04-17"),
    endDate: parseDateInput("2026-04-20"),
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
      rentalStartDate: "2026-04-17",
      rentalEndDate: "2026-04-20",
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
      await createOrderMutation.mutateAsync({ data: payload });
      clearCart();
      showSuccess({
        message: "Rental order has been submitted.",
        duration: 1800,
        onDismiss: () => navigation.navigate("EquipmentList"),
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

  return (
    <ScreenShell title="Rental Cart" subtitle="Review items, assign customer, and submit an order.">
      <Card style={styles.sectionCard}>
        <Card.Title title="Cart Items" />
        <Card.Content style={styles.cardContent}>
          {items.length === 0 ? (
            <Text variant="bodyMedium">
              No equipment selected yet. Add items from Equipment Fleet.
            </Text>
          ) : (
            items.map((item, index) => (
              <View key={item.equipmentId}>
                <View style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text variant="titleMedium">{item.name}</Text>
                    <Text variant="bodySmall">${item.dailyRate.toFixed(2)} / day</Text>
                  </View>

                  <QuantityControl
                    quantity={item.quantity}
                    onDecrease={() => updateQuantity(item.equipmentId, -1)}
                    onIncrease={() => updateQuantity(item.equipmentId, 1)}
                  />
                </View>
                <Button
                  compact
                  icon="delete-outline"
                  mode="text"
                  onPress={() => removeFromCart(item.equipmentId)}
                >
                  Remove
                </Button>
                {index < items.length - 1 ? <Divider /> : null}
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title title="Order Details" />
        <Card.Content style={styles.cardContent}>
          <View>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Customer
            </Text>
            <Menu
              visible={customerMenuVisible}
              onDismiss={() => setCustomerMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  icon="chevron-down"
                  contentStyle={styles.menuButtonContent}
                  onPress={() => setCustomerMenuVisible(true)}
                >
                  {selectedCustomer?.companyName ?? "Select customer"}
                </Button>
              }
            >
              {customers.map((customer) => (
                <Menu.Item
                  key={customer.id}
                  title={customer.companyName}
                  onPress={() => {
                    setValue("customerId", customer.id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setCustomerMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            {errors.customerId ? <Text style={styles.errorText}>{errors.customerId.message}</Text> : null}
            {customersQuery.error ? (
              <Text variant="bodySmall" style={styles.errorText}>
                Failed to load customers from backend.
              </Text>
            ) : null}
          </View>

          <View>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Rental Period
            </Text>
            <Button
              mode="outlined"
              icon="calendar-range"
              contentStyle={styles.menuButtonContent}
              style={[
                styles.dateRangeButton,
                errors.rentalStartDate || errors.rentalEndDate ? styles.dateRangeButtonError : null,
              ]}
              onPress={() => setIsDateRangePickerVisible(true)}
            >
              {dateRangeLabel}
            </Button>
          </View>
          {errors.rentalStartDate ? (
            <Text style={styles.errorText}>{errors.rentalStartDate.message}</Text>
          ) : null}
          {errors.rentalEndDate ? <Text style={styles.errorText}>{errors.rentalEndDate.message}</Text> : null}
          <Text variant="titleMedium">Subtotal / day: ${subtotal.toFixed(2)}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="check-circle-outline"
        contentStyle={styles.confirmButtonContent}
        loading={createOrderMutation.isPending}
        disabled={createOrderMutation.isPending || items.length === 0 || customersQuery.isPending}
        onPress={handleSubmit(onConfirmOrder)}
      >
        Confirm Order
      </Button>

      <DatePickerModal
        locale="en-GB"
        mode="range"
        visible={isDateRangePickerVisible}
        onDismiss={() => setIsDateRangePickerVisible(false)}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        saveLabel="Apply"
        label="Select rental period"
        onConfirm={({ startDate, endDate }) => {
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
        }}
      />
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: "#ffffff",
  },
  cardContent: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  fieldLabel: {
    marginBottom: 6,
    color: "#334155",
  },
  errorText: {
    marginTop: 2,
    color: "#b91c1c",
  },
  dateRangeButton: {
    borderColor: "#cbd5e1",
  },
  dateRangeButtonError: {
    borderColor: "#b91c1c",
  },
  menuButtonContent: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  confirmButtonContent: {
    minHeight: 48,
  },
});
