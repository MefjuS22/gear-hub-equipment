import { Box, Button, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCmspostPublishedSlug } from "../../api/generated/react-query";
import { sanitizeCmsHtml } from "../../lib/sanitizeCmsHtml";
import { LoadingState } from "../common";

type PortalNewsPostViewProps = {
  slug: string;
};

function formatPublished(iso: string | undefined) {
  if (!iso) return "";
  const d = dayjs(iso);
  return d.isValid() ? d.format("MMMM D, YYYY") : "";
}

export function PortalNewsPostView({ slug }: PortalNewsPostViewProps) {
  const { data, isLoading, isError, isSuccess } = useGetApiCmspostPublishedSlug(
    slug,
    { client: gearhubApiClientOptions },
  );

  if (isLoading) {
    return <LoadingState message="Loading article…" />;
  }

  if (isError || (isSuccess && !data?.slug)) {
    return (
      <Box>
        <Button
          component={Link}
          to="/portal/news"
          startIcon={<ChevronLeft size={18} aria-hidden />}
          sx={{ mb: 2 }}
        >
          Back to news
        </Button>
        <Typography color="error">
          This article could not be found or is no longer published.
        </Typography>
      </Box>
    );
  }

  const safe = sanitizeCmsHtml(data?.bodyHtml ?? "");

  return (
    <Box>
      <Button
        component={Link}
        to="/portal/news"
        startIcon={<ChevronLeft size={18} aria-hidden />}
        sx={{ mb: 2 }}
      >
        Back to news
      </Button>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block" }}>
        {formatPublished(data?.publishedAtUtc)}
      </Typography>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mt: 0.5 }}>
        {data?.title}
      </Typography>
      {data?.excerpt ? (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          sx={{ mt: 2, maxWidth: 720 }}
        >
          {data.excerpt}
        </Typography>
      ) : null}
      <Box
        className="cms-content"
        sx={{
          mt: 3,
          maxWidth: 720,
          "& h2": {
            fontSize: "1.35rem",
            fontWeight: 700,
            mt: 3,
            mb: 1.5,
          },
          "& h3": {
            fontSize: "1.15rem",
            fontWeight: 700,
            mt: 2.5,
            mb: 1,
          },
          "& p": { mb: 2, lineHeight: 1.75 },
          "& ul, & ol": { pl: 3, mb: 2 },
          "& li": { mb: 0.5 },
          "& a": { color: "primary.main" },
          "& blockquote": {
            borderLeft: 4,
            borderColor: "divider",
            pl: 2,
            ml: 0,
            my: 2,
            color: "text.secondary",
          },
          "& pre": {
            bgcolor: "action.hover",
            p: 2,
            borderRadius: 1,
            overflow: "auto",
            fontSize: "0.875rem",
          },
        }}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </Box>
  );
}
