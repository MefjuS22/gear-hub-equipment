import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Divider, Menu, Text, TextInput } from "react-native-paper";
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
  const {
    control,
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

          <Controller
            control={control}
            name="rentalStartDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Rental Start Date (YYYY-MM-DD)"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                error={Boolean(errors.rentalStartDate)}
              />
            )}
          />
          {errors.rentalStartDate ? (
            <Text style={styles.errorText}>{errors.rentalStartDate.message}</Text>
          ) : null}

          <Controller
            control={control}
            name="rentalEndDate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Rental End Date (YYYY-MM-DD)"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                error={Boolean(errors.rentalEndDate)}
              />
            )}
          />
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
    marginTop: 8,
    color: "#b91c1c",
  },
  menuButtonContent: {
    justifyContent: "space-between",
    flexDirection: "row-reverse",
  },
  confirmButtonContent: {
    minHeight: 48,
  },
});
