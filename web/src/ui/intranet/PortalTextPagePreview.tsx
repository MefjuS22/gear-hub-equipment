import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Heart, LayoutGrid, List, Package, ShoppingCart } from "lucide-react";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiPortaltext } from "../../api/generated/react-query";
import {
  getOverrideHtml,
  getOverridePlain,
  getPortalTextPreviewPage,
  buildPortalTextOverrides,
  type PortalTextOverrides,
} from "../../lib/portalTextPreview";
import {
  EmptyState,
  PageHeader,
  PortalHtmlBlock,
  SectionCard,
  StatusChip,
} from "../common";
import { PortalPreviewChrome } from "./PortalPreviewChrome";

type PortalTextPagePreviewProps = {
  textKey: string;
  bodyHtml: string;
};

const PREVIEW_SAMPLE_ARTICLES = [
  {
    title: "Winter maintenance checklist",
    date: "Mar 12, 2026",
    excerpt: "Keep lifts and platforms ready for cold-weather jobs.",
  },
  {
    title: "New arrivals in the lifting category",
    date: "Feb 28, 2026",
    excerpt: "Recently added units with transparent daily pricing.",
  },
] as const;

function PreviewShell({
  textKey,
  bodyHtml,
}: PortalTextPagePreviewProps) {
  const list = useGetApiPortaltext({ client: gearhubApiClientOptions });
  const overrides = buildPortalTextOverrides(
    textKey,
    bodyHtml,
    list.data ?? [],
  );
  const page = getPortalTextPreviewPage(textKey);

  return (
    <SectionCard title="Portal preview">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Live preview on the customer portal page where this text appears.
      </Typography>
      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.default",
          "& a, & button": { pointerEvents: "none" },
        }}
      >
        <PortalPreviewChrome activePage={page} />
        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: 1200,
            width: "100%",
            mx: "auto",
            boxSizing: "border-box",
          }}
        >
          {page === "catalog" ? (
            <CatalogPagePreview overrides={overrides} />
          ) : null}
          {page === "equipment" ? (
            <EquipmentPagePreview overrides={overrides} />
          ) : null}
          {page === "cart" ? <CartPagePreview overrides={overrides} /> : null}
          {page === "news" ? <NewsPagePreview overrides={overrides} /> : null}
        </Box>
      </Box>
    </SectionCard>
  );
}

function CatalogPagePreview({
  overrides,
}: {
  overrides: PortalTextOverrides;
}) {
  return (
    <Box>
      <PageHeader
        title={getOverridePlain(overrides, "catalog.hero.title")}
        subtitle={getOverridePlain(overrides, "catalog.hero.subtitle")}
      />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              View
            </Typography>
            <ToggleButtonGroup size="small" value="grid" exclusive>
              <ToggleButton value="grid" aria-label="Grid">
                <LayoutGrid size={16} style={{ marginRight: 6 }} aria-hidden />
                Grid
              </ToggleButton>
              <ToggleButton value="list" aria-label="List">
                <List size={16} style={{ marginRight: 6 }} aria-hidden />
                List
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip label="All equipment" color="primary" />
            <Chip label="Lifting" variant="outlined" />
            <Chip label="Power" variant="outlined" />
            <Chip label="Access" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
          },
          gap: 2,
        }}
      >
        <CatalogSampleCard
          name="Scissor lift 26 ft"
          category="Lifting · LiftMaster"
          featured
          descriptionHtml={getOverrideHtml(overrides, "catalog.featured.fallback")}
        />
        <CatalogSampleCard
          name="Industrial generator 20 kW"
          category="Power · VoltPro"
        />
      </Box>
    </Box>
  );
}

function CatalogSampleCard({
  name,
  category,
  featured = false,
  descriptionHtml,
}: {
  name: string;
  category: string;
  featured?: boolean;
  descriptionHtml?: string;
}) {
  return (
    <Card variant="outlined" sx={{ display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          height: featured ? 200 : 140,
          bgcolor: "grey.200",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Package size={featured ? 72 : 48} strokeWidth={1} color="#94a3b8" aria-hidden />
      </Box>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <StatusChip status="available" />
          <Heart size={18} aria-hidden color="#94a3b8" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: featured ? 2 : 1 }}>
          {category}
        </Typography>
        {featured && descriptionHtml ? (
          <PortalHtmlBlock html={descriptionHtml} sx={{ mb: 2, flex: 1 }} />
        ) : null}
        {featured ? (
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Daily rate
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                $89.00
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Availability
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                In stock
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 700, mt: "auto" }}>
            $125.00 / day
          </Typography>
        )}
        <Button variant="outlined" size="small" disabled sx={{ alignSelf: "flex-start" }}>
          View details
        </Button>
      </CardContent>
    </Card>
  );
}

function EquipmentPagePreview({
  overrides,
}: {
  overrides: PortalTextOverrides;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1.2fr" },
        gap: 3,
        alignItems: "start",
      }}
    >
      <Card variant="outlined">
        <Box
          sx={{
            aspectRatio: "4/3",
            bgcolor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Package size={72} strokeWidth={1} color="#94a3b8" aria-hidden />
        </Box>
      </Card>
      <Card variant="outlined">
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Scissor lift 26 ft
            </Typography>
            <Chip label="Available" color="success" size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Unit #1042
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              $89.00
            </Typography>
            <Typography variant="body1" color="text.secondary">
              / day
            </Typography>
          </Box>

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Description
          </Typography>
          <PortalHtmlBlock
            html={getOverrideHtml(overrides, "catalog.featured.fallback")}
            sx={{ mb: 1 }}
          />

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Catalog
          </Typography>
          <Typography variant="body2">
            <strong>Category:</strong> Lifting
          </Typography>
          <Typography variant="body2">
            <strong>Brand:</strong> LiftMaster
          </Typography>
          <Typography variant="body2">
            <strong>Warehouse:</strong> Central depot
          </Typography>

          <Button variant="containedBlack" disabled sx={{ alignSelf: "flex-start", mt: 1 }}>
            Add to cart
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

function CartPagePreview({ overrides }: { overrides: PortalTextOverrides }) {
  return (
    <Box>
      <PageHeader
        title="Order builder"
        subtitle="Configure client details and rental parameters, then confirm your equipment cart."
      />
      <EmptyState
        icon={ShoppingCart}
        title={getOverridePlain(overrides, "cart.empty.title")}
        description={getOverridePlain(overrides, "cart.empty.body")}
      />
    </Box>
  );
}

function NewsPagePreview({ overrides }: { overrides: PortalTextOverrides }) {
  return (
    <Box>
      <PageHeader
        title={getOverridePlain(overrides, "news.list.title")}
        titleVariant="h5"
        subtitle={getOverridePlain(overrides, "news.list.subtitle")}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {PREVIEW_SAMPLE_ARTICLES.map((post) => (
          <Card key={post.title} variant="outlined">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: 160 },
                  minHeight: { xs: 120, sm: "auto" },
                  bgcolor: "grey.200",
                  flexShrink: 0,
                }}
              />
              <CardContent sx={{ flex: 1, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {post.date}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {post.excerpt}
                </Typography>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export function PortalTextPagePreview(props: PortalTextPagePreviewProps) {
  return <PreviewShell {...props} />;
}
