import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  Heart,
  LayoutGrid,
  List,
  Minus,
  Package,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { formatUsd } from "../../lib/formatCurrency";
import { resolveMediaSrc } from "../../lib/resolveMediaSrc";
import {
  PORTAL_HERO,
  usePortalCatalog,
} from "../../hooks/portal/usePortalCatalog";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
  PageHeader,
  StatusChip,
} from "../common";
import { usePortalCatalogSearch } from "./PortalCatalogSearchContext";
import { useCart } from "./cartContext";

type CatalogOrderControlProps = {
  equipmentId: number;
  name: string;
  dailyRate: number;
  isAvailable: boolean;
  featured?: boolean;
  fullWidth?: boolean;
};

function CatalogOrderControl({
  equipmentId,
  name,
  dailyRate,
  isAvailable,
  featured = false,
  fullWidth = false,
}: CatalogOrderControlProps) {
  const { lines, add, setQuantity } = useCart();
  const qty = lines.find((l) => l.equipmentId === equipmentId)?.quantity ?? 0;
  const btnSize = featured ? "large" : "small";
  const iconBtnSize = featured ? "medium" : "small";
  const countVariant = featured ? "body1" : "body2";

  if (!isAvailable) {
    return (
      <Button variant="outlined" size="small" disabled fullWidth={fullWidth}>
        Unavailable
      </Button>
    );
  }

  if (qty < 1) {
    return (
      <Button
        variant="containedBlack"
        size={btnSize}
        fullWidth={fullWidth}
        startIcon={<ShoppingCart size={16} aria-hidden />}
        onClick={() => add({ equipmentId, name, dailyRate })}
      >
        Add to order
      </Button>
    );
  }

  const stepper: ReactNode = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        maxWidth: fullWidth ? "100%" : undefined,
        width: fullWidth ? "100%" : "inline-flex",
        justifyContent: fullWidth ? "center" : undefined,
        boxSizing: "border-box",
      }}
    >
      <IconButton
        size={iconBtnSize}
        aria-label="Decrease quantity"
        onClick={() => setQuantity(equipmentId, qty - 1)}
      >
        <Minus size={16} aria-hidden />
      </IconButton>
      <Typography
        variant={countVariant}
        sx={{ minWidth: 32, textAlign: "center", fontWeight: 600 }}
      >
        {qty}
      </Typography>
      <IconButton
        size={iconBtnSize}
        aria-label="Increase quantity"
        onClick={() => setQuantity(equipmentId, qty + 1)}
      >
        <Plus size={16} aria-hidden />
      </IconButton>
    </Box>
  );

  if (fullWidth) {
    return (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
        {stepper}
      </Box>
    );
  }
  return stepper;
}

export function PortalCatalogView() {
  const { equipment } = usePortalCatalog();
  const { search } = usePortalCatalogSearch();
  const [categoryKey, setCategoryKey] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of equipment.data ?? []) {
      const c = item.categoryName?.trim();
      if (c) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [equipment.data]);

  const filtered = useMemo(() => {
    const rows = equipment.data ?? [];
    const q = search.trim().toLowerCase();
    return rows.filter((item) => {
      if (categoryKey !== "all") {
        const c = item.categoryName?.trim() ?? "";
        if (c !== categoryKey) return false;
      }
      if (!q) return true;
      const hay =
        `${item.name ?? ""} ${item.brandName ?? ""} ${item.categoryName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [equipment.data, search, categoryKey]);

  if (equipment.isLoading) {
    return <LoadingState message="Loading catalog…" />;
  }
  if (equipment.error) {
    return (
      <ErrorAlert
        message="Failed to load catalog. Please try again."
        sx={{ mb: 2 }}
      />
    );
  }

  return (
    <Box>
      <PageHeader title={PORTAL_HERO.title} subtitle={PORTAL_HERO.body} />

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
            <ToggleButtonGroup
              size="small"
              value={view}
              exclusive
              onChange={(_, v) => v && setView(v)}
              aria-label="Catalog view"
            >
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
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Chip
              label="All equipment"
              onClick={() => setCategoryKey("all")}
              color={categoryKey === "all" ? "primary" : "default"}
              variant={categoryKey === "all" ? "filled" : "outlined"}
            />
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => setCategoryKey(c)}
                color={categoryKey === c ? "primary" : "default"}
                variant={categoryKey === c ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No equipment matches"
          description="Try another category or clear your search."
          icon={Package}
        />
      ) : view === "list" ? (
        <TableContainer component={Card} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={72} />
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell align="right">Daily rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" width={200} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ py: 0.5 }}>
                    {resolveMediaSrc(item.imageUrl) ? (
                      <Box
                        component="img"
                        src={resolveMediaSrc(item.imageUrl)}
                        alt=""
                        sx={{
                          width: 56,
                          height: 56,
                          objectFit: "cover",
                          borderRadius: 1,
                          display: "block",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Package size={22} color="#94a3b8" aria-hidden />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{item.brandName}</TableCell>
                  <TableCell align="right">
                    {formatUsd(item.dailyRate ?? 0)}
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      status={item.isAvailable ? "available" : "unavailable"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <CatalogOrderControl
                        equipmentId={item.id ?? 0}
                        name={item.name ?? ""}
                        dailyRate={item.dailyRate ?? 0}
                        isAvailable={!!item.isAvailable}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((item, index) => {
            const featured = index === 0;
            const gridSize =
              featured && filtered.length > 1
                ? { xs: 12, md: 8 }
                : featured && filtered.length === 1
                  ? { xs: 12, md: 12 }
                  : { xs: 12, sm: 6, md: 4 };
            const catalogImg = resolveMediaSrc(item.imageUrl);
            return (
              <Grid key={item.id} size={gridSize}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: featured
                      ? { xs: "column", md: "row" }
                      : "column",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      borderColor: "primary.light",
                    },
                  }}
                >
                  {featured ? (
                    <Box
                      sx={{
                        width: { xs: "100%", md: "42%" },
                        minHeight: 200,
                        bgcolor: "grey.200",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {catalogImg ? (
                        <Box
                          component="img"
                          src={catalogImg}
                          alt=""
                          sx={{
                            width: "100%",
                            height: "100%",
                            minHeight: 200,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Package
                          size={72}
                          strokeWidth={1}
                          color="#94a3b8"
                          aria-hidden
                        />
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        bgcolor: "grey.200",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {catalogImg ? (
                        <Box
                          component="img"
                          src={catalogImg}
                          alt=""
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Package
                          size={48}
                          strokeWidth={1}
                          color="#94a3b8"
                          aria-hidden
                        />
                      )}
                    </Box>
                  )}
                  <CardContent
                    sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <StatusChip
                        status={item.isAvailable ? "available" : "unavailable"}
                      />
                      <IconButton
                        size="small"
                        aria-label="Save to favorites (coming soon)"
                        disabled
                      >
                        <Heart size={18} aria-hidden />
                      </IconButton>
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 700 }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: featured ? 2 : 1 }}
                    >
                      {item.categoryName} · {item.brandName}
                    </Typography>
                    {featured ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, flex: 1 }}
                      >
                        Reliable rental unit with transparent daily pricing. Add
                        to your order to reserve dates at checkout.
                      </Typography>
                    ) : null}
                    {featured ? (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 3,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Daily rate
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {formatUsd(item.dailyRate ?? 0)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Availability
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.isAvailable ? "In stock" : "Booked"}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body1" sx={{ mb: 2, flex: 1 }}>
                        <strong>{formatUsd(item.dailyRate ?? 0)}</strong> / day
                      </Typography>
                    )}
                    <Box sx={{ mt: "auto" }}>
                      <CatalogOrderControl
                        equipmentId={item.id ?? 0}
                        name={item.name ?? ""}
                        dailyRate={item.dailyRate ?? 0}
                        isAvailable={!!item.isAvailable}
                        featured={featured}
                        fullWidth={featured}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
