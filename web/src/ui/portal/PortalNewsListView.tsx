import { Box, Card, CardContent, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "@tanstack/react-router";
import { Newspaper } from "lucide-react";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCmspostPublished } from "../../api/generated/react-query";
import { resolveMediaSrc } from "../../lib/resolveMediaSrc";
import { EmptyState, LoadingState, PageHeader } from "../common";

function formatPublished(iso: string | undefined) {
  if (!iso) return "";
  const d = dayjs(iso);
  return d.isValid() ? d.format("MMM D, YYYY") : "";
}

export function PortalNewsListView() {
  const { data, isLoading, isError } = useGetApiCmspostPublished({
    client: gearhubApiClientOptions,
  });

  if (isLoading) {
    return <LoadingState message="Loading news…" />;
  }

  if (isError) {
    return (
      <Box>
        <PageHeader
          title="News"
          titleVariant="h5"
          subtitle="Updates and articles from GearHub."
        />
        <Typography color="error" sx={{ mt: 2 }}>
          Could not load articles. Please try again later.
        </Typography>
      </Box>
    );
  }

  const posts = data ?? [];

  return (
    <Box>
      <PageHeader
        title="News"
        titleVariant="h5"
        subtitle="Updates, tips, and announcements from our team."
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Check back soon for news and guides."
          icon={Newspaper}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {posts.map((post) => {
            const slug = post.slug ?? "";
            const thumb = resolveMediaSrc(post.coverImageUrl);
            return (
              <Card key={post.id} variant="outlined">
                <Link
                  to="/portal/news/$slug"
                  params={{ slug }}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 0,
                    }}
                  >
                    {thumb ? (
                      <Box
                        component="img"
                        src={thumb}
                        alt=""
                        sx={{
                          width: { xs: "100%", sm: 160 },
                          minHeight: { xs: 140, sm: "auto" },
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    ) : null}
                    <CardContent sx={{ flex: 1, "&:last-child": { pb: 2 } }}>
                      <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {formatPublished(post.publishedAtUtc)}
                      </Typography>
                      <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                        {post.title}
                      </Typography>
                      {post.excerpt ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {post.excerpt}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </Box>
                </Link>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
