import { useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Card, Text } from "react-native-paper";

import { resolvePublicFileUrl } from "../../api/resolvePublicFileUrl";
import { CrudListSearchField } from "../../components/admin/CrudListSearchField";
import { generatedClientConfig } from "../../api/generatedConfig";
import { useGetApiCmspostPublished } from "../../api/generated/react-query";
import type { CmsPostPublicSummaryDto } from "../../api/generated/types";
import type { NewsStackParamList } from "../../navigation/navigationTypes";

type Props = NativeStackScreenProps<NewsStackParamList, "NewsList">;

export const NewsListScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState("");
  const listQuery = useGetApiCmspostPublished({ client: generatedClientConfig });

  const filtered = useMemo(() => {
    const list = listQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return list;
    }
    return list.filter(
      (p) =>
        (p.title ?? "").toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q),
    );
  }, [listQuery.data, query]);

  const renderItem = ({ item }: { item: CmsPostPublicSummaryDto }) => {
    const slug = item.slug ?? "";
    const cover = item.coverImageUrl ? resolvePublicFileUrl(item.coverImageUrl) : "";
    return (
      <Card style={styles.card} mode="elevated" onPress={() => navigation.navigate("NewsDetail", { slug })}>
        {cover ? <Card.Cover source={{ uri: cover }} style={styles.thumb} /> : null}
        <Card.Title title={item.title ?? "—"} subtitle={item.excerpt ?? undefined} />
        {item.publishedAtUtc ? (
          <Card.Content style={styles.metaRow}>
            <Text variant="labelSmall" style={styles.date}>
              {new Date(item.publishedAtUtc).toLocaleDateString()}
            </Text>
          </Card.Content>
        ) : null}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <CrudListSearchField value={query} onChangeText={setQuery} placeholder="Search articles…" />
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => String(item.slug ?? item.id ?? index)}
          renderItem={renderItem}
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
                <Card.Title title={listQuery.error ? "Load failed" : "No published articles"} />
                <Card.Content>
                  <Text variant="bodyMedium">
                    {listQuery.error
                      ? "Check your connection and API URL."
                      : "New articles will appear here when published."}
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
  list: { gap: 12, paddingBottom: 24 },
  card: { backgroundColor: "#ffffff" },
  thumb: { height: 160 },
  metaRow: { paddingTop: 0 },
  date: { color: "#64748b" },
});
