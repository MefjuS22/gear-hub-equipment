import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, FAB, IconButton, Text } from "react-native-paper";

import { CrudListSearchField } from "../../components/admin/CrudListSearchField";
import { generatedClientConfig } from "../../api/generatedConfig";
import {
  getApiBrandQueryKey,
  useDeleteApiBrandId,
  useGetApiBrand,
} from "../../api/generated/react-query";
import type { BrandLookupDto } from "../../api/generated/types";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { getApiErrorDisplayMessage, handleApiError } from "../../lib/apiError";
import { useAppToast } from "../../providers/AppToastProvider";
import { useQueryClient } from "@tanstack/react-query";

type Props = NativeStackScreenProps<CatalogStackParamList, "BrandList">;

export const BrandListScreen = ({ navigation }: Props) => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useAppToast();
  const [query, setQuery] = useState("");
  const brandsQuery = useGetApiBrand({ client: generatedClientConfig });
  const deleteMutation = useDeleteApiBrandId({ client: generatedClientConfig });

  const filtered = useMemo(() => {
    const list = brandsQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter((b) => (b.name ?? "").toLowerCase().includes(q));
  }, [brandsQuery.data, query]);

  const onDelete = useCallback(
    (item: BrandLookupDto) => {
      const id = item.id;
      if (id == null) {
        return;
      }
      Alert.alert("Delete brand", `Remove "${item.name ?? "this brand"}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteMutation.mutateAsync({ id });
                await queryClient.invalidateQueries({ queryKey: getApiBrandQueryKey() });
                showSuccess({ message: "Brand deleted.", duration: 1600 });
              } catch (err) {
                handleApiError(err, { showError });
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
              refreshing={brandsQuery.isRefetching}
              onRefresh={() => {
                void brandsQuery.refetch();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            brandsQuery.isPending ? (
              <Card>
                <Card.Title title="Loading…" />
              </Card>
            ) : (
              <Card>
                <Card.Title title={brandsQuery.error ? "Load failed" : "No brands"} />
                <Card.Content>
                  <Text variant="bodyMedium">
                    {brandsQuery.error
                      ? getApiErrorDisplayMessage(brandsQuery.error)
                      : "Add a brand with the + button."}
                  </Text>
                </Card.Content>
              </Card>
            )
          }
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              mode="elevated"
              onPress={() => navigation.navigate("BrandForm", { brandId: item.id })}
            >
              <Card.Title
                title={item.name ?? "—"}
                subtitle={`ID ${item.id ?? "?"}`}
                right={() => (
                  <IconButton
                    icon="delete-outline"
                    onPress={() => onDelete(item)}
                    accessibilityLabel="Delete brand"
                  />
                )}
              />
            </Card>
          )}
        />
      </View>
      <FAB
        icon="plus"
        label="Add brand"
        style={styles.fab}
        onPress={() => navigation.navigate("BrandForm", {})}
      />
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
