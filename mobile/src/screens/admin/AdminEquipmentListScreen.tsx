import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Card, FAB, IconButton, Text } from "react-native-paper";

import { resolvePublicFileUrl } from "../../api/resolvePublicFileUrl";
import { EquipmentImagePlaceholder } from "../../components/equipment-list/EquipmentImagePlaceholder";
import { CrudListSearchField } from "../../components/admin/CrudListSearchField";
import { generatedClientConfig } from "../../api/generatedConfig";
import {
  getApiEquipmentQueryKey,
  useDeleteApiEquipmentId,
  useGetApiEquipment,
} from "../../api/generated/react-query";
import type { Equipment } from "../../types";
import { mapApiEquipment } from "../../api/mappers";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { useAppToast } from "../../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "AdminEquipmentList">;

export const AdminEquipmentListScreen = ({ navigation }: Props) => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useAppToast();
  const [query, setQuery] = useState("");
  const deleteMutation = useDeleteApiEquipmentId({ client: generatedClientConfig });
  const equipmentQuery = useGetApiEquipment({
    client: generatedClientConfig,
    query: {
      select: (data) => data.map(mapApiEquipment),
    },
  });

  const filtered = useMemo(() => {
    const list = equipmentQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        String(e.categoryId).includes(q) ||
        String(e.brandId).includes(q) ||
        (e.warehouseName ?? "").toLowerCase().includes(q),
    );
  }, [equipmentQuery.data, query]);

  const onDelete = useCallback(
    (item: Equipment) => {
      Alert.alert("Delete equipment", `Remove "${item.name}" (unit #${item.id})? This cannot be undone.`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteMutation.mutateAsync({ id: item.id });
                await queryClient.invalidateQueries({ queryKey: getApiEquipmentQueryKey() });
                showSuccess({ message: "Equipment deleted.", duration: 1600 });
              } catch {
                showError({
                  message: "Unable to delete. It may be referenced by open orders.",
                });
              }
            })();
          },
        },
      ]);
    },
    [deleteMutation, queryClient, showError, showSuccess],
  );

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <CrudListSearchField value={query} onChangeText={setQuery} placeholder="Search equipment…" />
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={equipmentQuery.isRefetching}
              onRefresh={() => {
                void equipmentQuery.refetch();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            equipmentQuery.isPending ? (
              <Card>
                <Card.Title title="Loading…" />
              </Card>
            ) : (
              <Card>
                <Card.Title title={equipmentQuery.error ? "Load failed" : "No equipment"} />
                <Card.Content>
                  <Text variant="bodyMedium">
                    {equipmentQuery.error ? "Check your connection and API URL." : "Create equipment with the + button."}
                  </Text>
                </Card.Content>
              </Card>
            )
          }
          renderItem={({ item }) => {
            const thumbUri = item.imageUrl ? resolvePublicFileUrl(item.imageUrl) : "";
            return (
              <Card style={styles.card} mode="elevated">
                <Card.Title title={item.name} subtitle={`#${item.id} · $${item.dailyRate.toFixed(2)}/day`} />
                <Card.Content style={styles.cardBody}>
                  {thumbUri ? (
                    <Image source={{ uri: thumbUri }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <EquipmentImagePlaceholder size={72} iconSize={28} />
                  )}
                  <View style={styles.cardText}>
                    <Text variant="bodySmall" style={styles.meta}>
                      Category {item.categoryId} ({item.categoryName ?? "—"}) · Brand {item.brandId} (
                      {item.brandName ?? "—"})
                    </Text>
                    <Text variant="bodySmall" style={styles.meta}>
                      Warehouse {item.warehouseId} ({item.warehouseName ?? "—"})
                    </Text>
                  </View>
                </Card.Content>
                <Card.Actions style={styles.actions}>
                  <Button mode="contained-tonal" onPress={() => navigation.navigate("EquipmentForm", { equipmentId: item.id })}>
                    Edit
                  </Button>
                  <IconButton icon="delete-outline" onPress={() => onDelete(item)} accessibilityLabel="Delete equipment" />
                </Card.Actions>
              </Card>
            );
          }}
        />
      </View>
      <FAB icon="plus" label="Add equipment" style={styles.fab} onPress={() => navigation.navigate("EquipmentForm", {})} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  inner: { flex: 1, padding: 16, paddingBottom: 88 },
  list: { gap: 10 },
  card: { backgroundColor: "#ffffff" },
  meta: { color: "#475569", marginTop: 4 },
  cardBody: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  thumb: { width: 72, height: 72, borderRadius: 8 },
  cardText: { flex: 1, gap: 4 },
  actions: { justifyContent: "flex-end", flexWrap: "wrap" },
  fab: { position: "absolute", right: 16, bottom: 20 },
});
