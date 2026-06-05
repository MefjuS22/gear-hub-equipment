import { useLayoutEffect, useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Divider, Text } from "react-native-paper";

import { generatedClientConfig } from "../../api/generatedConfig";
import { useGetApiOrder } from "../../api/generated/react-query";
import type { RentalOrderListDto } from "../../api/generated/types";
import type { OrdersStackParamList } from "../../navigation/navigationTypes";
import { getApiErrorDisplayMessage } from "../../lib/apiError";
import { formatCurrency } from "../../utils/formatCurrency";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

function formatDateTime(iso?: string) {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatDate(iso?: string) {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function lineSubtotal(line: NonNullable<RentalOrderListDto["items"]>[number]) {
  const q = line.quantity ?? 0;
  const p = line.unitPrice ?? 0;
  return q * p;
}

export const OrderDetailScreen = ({ navigation, route }: Props) => {
  const orderId = route.params.orderId;
  const ordersQuery = useGetApiOrder({ client: generatedClientConfig });

  const order = useMemo(
    () => ordersQuery.data?.find((o) => o.id === orderId) ?? null,
    [ordersQuery.data, orderId],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: order?.id != null ? `Order #${order.id}` : `Order #${orderId}`,
    });
  }, [navigation, order?.id, orderId]);

  const lineTotal = useMemo(() => {
    if (!order?.items?.length) {
      return 0;
    }
    return order.items.reduce((sum, line) => sum + lineSubtotal(line), 0);
  }, [order?.items]);

  if (ordersQuery.isPending && !ordersQuery.data) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge">Loading…</Text>
      </View>
    );
  }

  if (ordersQuery.isError) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>
          Could not load orders
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          {getApiErrorDisplayMessage(ordersQuery.error)}
        </Text>
        <Button mode="contained" style={styles.backBtn} onPress={() => void ordersQuery.refetch()}>
          Retry
        </Button>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text variant="titleMedium" style={styles.errorTitle}>
          Order not found
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          This order may have been removed or the list is out of date.
        </Text>
        <Button mode="contained" style={styles.backBtn} onPress={() => navigation.goBack()}>
          Go back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={ordersQuery.isRefetching}
          onRefresh={() => {
            void ordersQuery.refetch();
          }}
        />
      }
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.gap}>
          <Text variant="titleMedium">Summary</Text>
          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.muted}>
              Placed
            </Text>
            <Text variant="bodyMedium">{formatDateTime(order.orderDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.muted}>
              Rental window
            </Text>
            <Text variant="bodyMedium">
              {formatDate(order.rentalStartDate)} → {formatDate(order.rentalEndDate)}
            </Text>
          </View>
          <Divider />
          <Text variant="titleMedium">Customer</Text>
          <Text variant="bodyLarge">{order.customerCompanyName ?? "—"}</Text>
          {order.customerId != null ? (
            <Text variant="bodySmall" style={styles.muted}>
              Customer ID {order.customerId}
            </Text>
          ) : null}
          <Divider />
          <Text variant="titleMedium">Placed by</Text>
          <Text variant="bodyLarge">{order.userName ?? "—"}</Text>
          <Text variant="bodySmall" style={styles.muted}>
            {order.userEmail ?? "—"}
          </Text>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Title title="Line items" subtitle="Equipment linked on this rental" />
        <Card.Content style={styles.lineCardContent}>
          {order.items?.length ? (
            <>
              <View style={styles.lineTableHeader}>
                <Text variant="labelSmall" style={[styles.colEquipment, styles.lineHeaderLabel]}>
                  Equipment
                </Text>
                <Text variant="labelSmall" style={[styles.colQty, styles.lineHeaderLabel]}>
                  Qty
                </Text>
                <Text variant="labelSmall" style={[styles.colUnit, styles.lineHeaderLabel]}>
                  Unit / day
                </Text>
                <Text variant="labelSmall" style={[styles.colLine, styles.lineHeaderLabel]}>
                  Line
                </Text>
              </View>
              {order.items.map((line) => (
                <View key={`${line.equipmentId}-${line.equipmentName}`} style={styles.lineRow}>
                  <View style={styles.colEquipment}>
                    <Text variant="bodyMedium" numberOfLines={3}>
                      {line.equipmentName ?? `Equipment ${line.equipmentId ?? "?"}`}
                    </Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.colQty}>
                    {line.quantity ?? 0}
                  </Text>
                  <Text variant="bodyMedium" style={styles.colUnit} numberOfLines={1}>
                    ${formatCurrency(line.unitPrice ?? 0)}
                  </Text>
                  <Text variant="bodyMedium" style={styles.colLine} numberOfLines={1}>
                    ${formatCurrency(lineSubtotal(line))}
                  </Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text variant="titleSmall" style={styles.totalLabel}>
                  Estimated line total (qty × unit)
                </Text>
                <Text variant="titleMedium">${formatCurrency(lineTotal)}</Text>
              </View>
              <Text variant="bodySmall" style={styles.disclaimer}>
                Final rental totals depend on the full rental period at booking time.
              </Text>
            </>
          ) : (
            <Text variant="bodyMedium" style={styles.muted}>
              No line items on this order.
            </Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 16 },
  card: { backgroundColor: "#ffffff" },
  gap: { gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  muted: { color: "#64748b" },
  lineCardContent: { paddingTop: 4 },
  lineTableHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#cbd5e1",
  },
  lineHeaderLabel: { color: "#64748b", fontWeight: "600" },
  lineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  colEquipment: { flex: 1, minWidth: 0 },
  colQty: { width: 36, textAlign: "right", paddingTop: 2, color: "#0f172a" },
  colUnit: { width: 88, textAlign: "right", paddingTop: 2, color: "#0f172a" },
  colLine: {
    width: 80,
    textAlign: "right",
    paddingTop: 2,
    color: "#0f172a",
    fontVariant: ["tabular-nums"],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  totalLabel: { flex: 1, minWidth: 0 },
  disclaimer: { color: "#64748b", marginTop: 10 },
  centered: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  errorTitle: { color: "#0f172a", textAlign: "center" },
  backBtn: { marginTop: 12 },
});
