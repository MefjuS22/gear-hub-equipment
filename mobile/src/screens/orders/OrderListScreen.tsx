import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Chip, Text } from "react-native-paper";

import { CrudListSearchField } from "../../components/admin/CrudListSearchField";
import { generatedClientConfig } from "../../api/generatedConfig";
import { useGetApiOrder } from "../../api/generated/react-query";
import type { RentalOrderListDto } from "../../api/generated/types";
import type { OrdersStackParamList } from "../../navigation/navigationTypes";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderList">;

export const OrderListScreen = (_props: Props) => {
  const [query, setQuery] = useState("");
  const ordersQuery = useGetApiOrder({ client: generatedClientConfig });

  const filtered = useMemo(() => {
    const list = ordersQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (o) =>
        String(o.id).includes(q) ||
        (o.customerCompanyName ?? "").toLowerCase().includes(q) ||
        (o.userName ?? "").toLowerCase().includes(q),
    );
  }, [ordersQuery.data, query]);

  const renderItem = ({ item }: { item: RentalOrderListDto }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={`Order #${item.id ?? "?"}`}
        subtitle={item.customerCompanyName ?? "Customer"}
        right={() => (
          <Text variant="labelSmall" style={styles.date}>
            {item.orderDate ? new Date(item.orderDate).toLocaleString() : ""}
          </Text>
        )}
      />
      <Card.Content style={styles.gap}>
        <Text variant="bodySmall">
          Rental {item.rentalStartDate ? new Date(item.rentalStartDate).toLocaleDateString() : "?"} →{" "}
          {item.rentalEndDate ? new Date(item.rentalEndDate).toLocaleDateString() : "?"}
        </Text>
        <Text variant="bodySmall" style={styles.muted}>
          Placed by {item.userName ?? "—"} ({item.userEmail ?? "—"})
        </Text>
        <View style={styles.chips}>
          {(item.items ?? []).map((line) => (
            <Chip key={`${item.id}-${line.equipmentId}-${line.equipmentName}`} compact icon="package-variant">
              {line.equipmentName ?? `Equipment ${line.equipmentId}`} ×{line.quantity ?? 0}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text variant="titleMedium" style={styles.lead}>
          Each order links many equipment lines (many-to-many via rental order items).
        </Text>
        <CrudListSearchField value={query} onChangeText={setQuery} placeholder="Search orders…" />
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={ordersQuery.isRefetching}
              onRefresh={() => {
                void ordersQuery.refetch();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            ordersQuery.isPending ? (
              <Card>
                <Card.Title title="Loading…" />
              </Card>
            ) : (
              <Card>
                <Card.Title title={ordersQuery.error ? "Load failed" : "No orders yet"} />
                <Card.Content>
                  <Text variant="bodyMedium">
                    {ordersQuery.error
                      ? "Check your connection and API URL."
                      : "Create a rental from Browse to populate this list."}
                  </Text>
                </Card.Content>
              </Card>
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  inner: { flex: 1, padding: 16 },
  lead: { color: "#334155", marginBottom: 8 },
  list: { gap: 12, paddingBottom: 24 },
  card: { backgroundColor: "#ffffff" },
  date: { marginRight: 12, marginTop: 14, color: "#64748b" },
  gap: { gap: 8 },
  muted: { color: "#64748b" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
