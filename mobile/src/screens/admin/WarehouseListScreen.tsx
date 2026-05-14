import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Card, FAB, IconButton, Text } from "react-native-paper";

import { CrudListSearchField } from "../../components/admin/CrudListSearchField";
import { generatedClientConfig } from "../../api/generatedConfig";
import {
  getApiWarehouseQueryKey,
  useDeleteApiWarehouseId,
  useGetApiWarehouse,
} from "../../api/generated/react-query";
import type { WarehouseLookupDto } from "../../api/generated/types";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { useAppToast } from "../../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "WarehouseList">;

export const WarehouseListScreen = ({ navigation }: Props) => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useAppToast();
  const [query, setQuery] = useState("");
  const listQuery = useGetApiWarehouse({ client: generatedClientConfig });
  const deleteMutation = useDeleteApiWarehouseId({ client: generatedClientConfig });

  const filtered = useMemo(() => {
    const list = listQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (w) =>
        (w.name ?? "").toLowerCase().includes(q) || (w.location ?? "").toLowerCase().includes(q),
    );
  }, [listQuery.data, query]);

  const onDelete = useCallback(
    (item: WarehouseLookupDto) => {
      const id = item.id;
      if (id == null) {
        return;
      }
      Alert.alert("Delete warehouse", `Remove "${item.name ?? "this warehouse"}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteMutation.mutateAsync({ id });
                await queryClient.invalidateQueries({ queryKey: getApiWarehouseQueryKey() });
                showSuccess({ message: "Warehouse deleted.", duration: 1600 });
              } catch {
                showError({ message: "Unable to delete. It may still be referenced by equipment." });
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
        <CrudListSearchField value={query} onChangeText={setQuery} />
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id ?? item.name)}
          refreshControl={
            <RefreshControl
              refreshing={listQuery.isRefetching}
              onRefresh={() => {
                void listQuery.refetch();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            listQuery.isPending ? (
              <Card>
                <Card.Title title="Loading…" />
              </Card>
            ) : (
              <Card>
                <Card.Title title={listQuery.error ? "Load failed" : "No warehouses"} />
                <Card.Content>
                  <Text variant="bodyMedium">
                    {listQuery.error ? "Check your connection and API URL." : "Add a warehouse with the + button."}
                  </Text>
                </Card.Content>
              </Card>
            )
          }
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              mode="elevated"
              onPress={() => navigation.navigate("WarehouseForm", { warehouseId: item.id })}
            >
              <Card.Title
                title={item.name ?? "—"}
                subtitle={item.location ?? undefined}
                right={() => (
                  <IconButton
                    icon="delete-outline"
                    onPress={() => onDelete(item)}
                    accessibilityLabel="Delete warehouse"
                  />
                )}
              />
            </Card>
          )}
        />
      </View>
      <FAB icon="plus" label="Add warehouse" style={styles.fab} onPress={() => navigation.navigate("WarehouseForm", {})} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  inner: { flex: 1, padding: 16, paddingBottom: 88 },
  list: { gap: 10 },
  card: { backgroundColor: "#ffffff" },
  fab: { position: "absolute", right: 16, bottom: 20 },
});
