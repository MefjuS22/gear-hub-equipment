import { useMemo } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Chip, FAB, Text } from "react-native-paper";

import { generatedClientConfig } from "../api/generatedConfig";
import { useGetApiEquipment } from "../api/generated/react-query";
import { mapApiEquipment } from "../api/mappers";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useCartStore } from "../store/useCartStore";

type Props = NativeStackScreenProps<RootStackParamList, "EquipmentList">;

export const EquipmentListScreen = ({ navigation }: Props) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const cartItemsCount = useCartStore((state) => state.items.length);
  const equipmentQuery = useGetApiEquipment({
    client: generatedClientConfig,
    query: {
      select: (data) => data.map(mapApiEquipment),
    },
  });
  const equipment = equipmentQuery.data ?? [];
  const loading = equipmentQuery.isPending;
  const refreshing = equipmentQuery.isRefetching;

  const listHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Equipment Fleet
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Add available units to the rental cart.
        </Text>
        <Button
          icon="cart-outline"
          mode="contained-tonal"
          onPress={() => navigation.navigate("CartOrder")}
        >
          Open Cart ({cartItemsCount})
        </Button>
      </View>
    ),
    [cartItemsCount, navigation],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipment}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={listHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void equipmentQuery.refetch();
            }}
          />
        }
        ListEmptyComponent={
          loading ? (
            <Card style={styles.emptyCard}>
              <Card.Title title="Loading equipment..." />
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Title title={equipmentQuery.error ? "Failed to load equipment" : "No equipment found"} />
              <Card.Content>
                <Text variant="bodyMedium">
                  {equipmentQuery.error
                    ? "Unable to fetch data from backend. Check if Docker services are running."
                    : "No equipment available in the database."}
                </Text>
              </Card.Content>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={item.name} subtitle={`Unit #${item.id}`} />
            <Card.Content style={styles.cardContent}>
              <View style={styles.metaRow}>
                <Chip compact>Category #{item.categoryId}</Chip>
                <Chip compact>Brand #{item.brandId}</Chip>
                <Chip compact>{item.dailyRate.toFixed(2)} / day</Chip>
              </View>
              <Button
                mode="contained"
                icon="cart-plus"
                disabled={!item.isAvailable}
                onPress={() => addToCart(item)}
              >
                {item.isAvailable ? "Add to Cart" : "Unavailable"}
              </Button>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        label="New Equipment"
        style={styles.fab}
        onPress={() => navigation.navigate("EquipmentForm")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listContent: {
    padding: 16,
    paddingBottom: 88,
    gap: 12,
  },
  header: {
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: "#001f3f",
    fontWeight: "700",
  },
  subtitle: {
    color: "#4b5563",
  },
  card: {
    backgroundColor: "#ffffff",
  },
  cardContent: {
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 20,
  },
});
