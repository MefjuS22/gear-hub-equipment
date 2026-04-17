import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Divider, Menu, Text, TextInput } from "react-native-paper";

import { generatedClientConfig } from "../api/generatedConfig";
import {
  useGetApiCustomer,
  usePostApiOrderCreateorder,
} from "../api/generated/react-query";
import type { PostApiOrderCreateorderMutationRequest } from "../api/generated/types";
import { mapApiCustomer } from "../api/mappers";
import { QuantityControl } from "../components/QuantityControl";
import { ScreenShell } from "../components/ScreenShell";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useCartStore } from "../store/useCartStore";
import { Customer } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "CartOrder">;
const CURRENT_USER_ID = 1;

export const CartOrderScreen = ({ navigation }: Props) => {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [rentalStartDate, setRentalStartDate] = useState("2026-04-17");
  const [rentalEndDate, setRentalEndDate] = useState("2026-04-20");
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

  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

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

  const onConfirmOrder = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Validation", "Please select a customer first.");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Validation", "Your cart is empty.");
      return;
    }

    const payload: PostApiOrderCreateorderMutationRequest = {
      customerId: selectedCustomerId,
      userId: CURRENT_USER_ID,
      rentalStartDate,
      rentalEndDate,
      items: items.map((item) => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
      })),
    };

    try {
      await createOrderMutation.mutateAsync({ data: payload });
      clearCart();
      Alert.alert("Order Confirmed", "Rental order has been submitted.", [
        { text: "OK", onPress: () => navigation.navigate("EquipmentList") },
      ]);
    } catch {
      Alert.alert("Order Failed", "Unable to post order. Please check API connectivity.");
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
                    setSelectedCustomerId(customer.id);
                    setCustomerMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            {customersQuery.error ? (
              <Text variant="bodySmall" style={styles.errorText}>
                Failed to load customers from backend.
              </Text>
            ) : null}
          </View>

          <TextInput
            label="Rental Start Date (YYYY-MM-DD)"
            mode="outlined"
            value={rentalStartDate}
            onChangeText={setRentalStartDate}
          />
          <TextInput
            label="Rental End Date (YYYY-MM-DD)"
            mode="outlined"
            value={rentalEndDate}
            onChangeText={setRentalEndDate}
          />
          <Text variant="titleMedium">Subtotal / day: ${subtotal.toFixed(2)}</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="check-circle-outline"
        contentStyle={styles.confirmButtonContent}
        loading={createOrderMutation.isPending}
        disabled={createOrderMutation.isPending || items.length === 0 || customersQuery.isPending}
        onPress={onConfirmOrder}
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
