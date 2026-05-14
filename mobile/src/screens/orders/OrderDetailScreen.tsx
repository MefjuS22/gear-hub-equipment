import { useLayoutEffect, useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, DataTable, Divider, Text } from "react-native-paper";

import { generatedClientConfig } from "../../api/generatedConfig";
import { useGetApiOrder } from "../../api/generated/react-query";
import type { RentalOrderListDto } from "../../api/generated/types";
import type { OrdersStackParamList } from "../../navigation/navigationTypes";
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
          Check your connection and try again.
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
        <Card.Content style={styles.tableWrap}>
          {order.items?.length ? (
            <>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Equipment</DataTable.Title>
                  <DataTable.Title numeric>Qty</DataTable.Title>
                  <DataTable.Title numeric>Unit / day</DataTable.Title>
                  <DataTable.Title numeric>Line</DataTable.Title>
                </DataTable.Header>
                {order.items.map((line) => (
                  <DataTable.Row key={`${line.equipmentId}-${line.equipmentName}`}>
                    <DataTable.Cell style={styles.eqCell}>
                      <Text variant="bodyMedium" numberOfLines={2}>
                        {line.equipmentName ?? `Equipment ${line.equipmentId ?? "?"}`}
                      </Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>{line.quantity ?? 0}</DataTable.Cell>
                    <DataTable.Cell numeric>${formatCurrency(line.unitPrice ?? 0)}</DataTable.Cell>
                    <DataTable.Cell numeric>${formatCurrency(lineSubtotal(line))}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
              <View style={styles.totalRow}>
                <Text variant="titleSmall">Estimated line total (qty × unit)</Text>
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
  tableWrap: { paddingHorizontal: 0 },
  eqCell: { flex: 2, minWidth: 120, paddingRight: 8 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  disclaimer: { color: "#64748b", marginTop: 8, paddingHorizontal: 16 },
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
