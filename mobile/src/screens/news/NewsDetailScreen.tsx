import { useMemo } from "react";
import { Image, StyleSheet, useWindowDimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "react-native-paper";
import RenderHtml from "react-native-render-html";

import { resolvePublicFileUrl, rewriteCmsBodyHtmlForNative } from "../../api/resolvePublicFileUrl";
import { generatedClientConfig } from "../../api/generatedConfig";
import { useGetApiCmspostPublishedSlug } from "../../api/generated/react-query";
import { ScreenShell } from "../../components/ScreenShell";
import type { NewsStackParamList } from "../../navigation/navigationTypes";

type Props = NativeStackScreenProps<NewsStackParamList, "NewsDetail">;

export const NewsDetailScreen = ({ route }: Props) => {
  const { slug } = route.params;
  const { width } = useWindowDimensions();
  const detailQuery = useGetApiCmspostPublishedSlug(slug, { client: generatedClientConfig });
  const post = detailQuery.data;

  const coverUri = useMemo(
    () => (post?.coverImageUrl ? resolvePublicFileUrl(post.coverImageUrl) : ""),
    [post?.coverImageUrl],
  );

  const htmlSource = useMemo(() => {
    const raw = post?.bodyHtml ?? "<p></p>";
    return { html: rewriteCmsBodyHtmlForNative(raw) };
  }, [post?.bodyHtml]);

  if (detailQuery.isPending) {
    return (
      <ScreenShell title="Loading…" scrollable={false}>
        <Text>Please wait.</Text>
      </ScreenShell>
    );
  }

  if (detailQuery.error || !post) {
    return (
      <ScreenShell title="Article" scrollable={false}>
        <Text variant="bodyLarge">This article could not be loaded.</Text>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title={post.title ?? "Article"} subtitle={post.excerpt ?? undefined}>
      {coverUri ? (
        <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
      ) : null}
      {post.publishedAtUtc ? (
        <Text variant="labelMedium" style={styles.date}>
          {new Date(post.publishedAtUtc).toLocaleString()}
        </Text>
      ) : null}
      <RenderHtml contentWidth={width - 32} source={htmlSource} />
    </ScreenShell>
  );
};

const styles = StyleSheet.create({
  cover: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  date: {
    color: "#64748b",
  },
});
