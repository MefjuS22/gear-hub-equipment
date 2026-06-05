import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { Card, FAB, IconButton, Text } from "react-native-paper";

import { CrudListSearchField } from "../../components/admin/CrudListSearchField";
import { generatedClientConfig } from "../../api/generatedConfig";
import {
  getApiCategoryQueryKey,
  useDeleteApiCategoryId,
  useGetApiCategory,
} from "../../api/generated/react-query";
import type { CategoryLookupDto } from "../../api/generated/types";
import type { CatalogStackParamList } from "../../navigation/navigationTypes";
import { getApiErrorDisplayMessage, handleApiError } from "../../lib/apiError";
import { useAppToast } from "../../providers/AppToastProvider";

type Props = NativeStackScreenProps<CatalogStackParamList, "CategoryList">;

export const CategoryListScreen = ({ navigation }: Props) => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useAppToast();
  const [query, setQuery] = useState("");
  const listQuery = useGetApiCategory({ client: generatedClientConfig });
  const deleteMutation = useDeleteApiCategoryId({ client: generatedClientConfig });

  const filtered = useMemo(() => {
    const list = listQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q),
    );
  }, [listQuery.data, query]);

  const onDelete = useCallback(
    (item: CategoryLookupDto) => {
      const id = item.id;
      if (id == null) {
        return;
      }
      Alert.alert("Delete category", `Remove "${item.name ?? "this category"}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await deleteMutation.mutateAsync({ id });
                await queryClient.invalidateQueries({ queryKey: getApiCategoryQueryKey() });
                showSuccess({ message: "Category deleted.", duration: 1600 });
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
                <Card.Title title={listQuery.error ? "Load failed" : "No categories"} />
                <Card.Content>
                  <Text variant="bodyMedium">
                    {listQuery.error
                      ? getApiErrorDisplayMessage(listQuery.error)
                      : "Add a category with the + button."}
                  </Text>
                </Card.Content>
              </Card>
            )
          }
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              mode="elevated"
              onPress={() => navigation.navigate("CategoryForm", { categoryId: item.id })}
            >
              <Card.Title
                title={item.name ?? "—"}
                subtitle={item.description ?? undefined}
                right={() => (
                  <IconButton
                    icon="delete-outline"
                    onPress={() => onDelete(item)}
                    accessibilityLabel="Delete category"
                  />
                )}
              />
            </Card>
          )}
        />
      </View>
      <FAB
        icon="plus"
        label="Add category"
        style={styles.fab}
        onPress={() => navigation.navigate("CategoryForm", {})}
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
