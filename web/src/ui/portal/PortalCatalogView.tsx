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
import { Heart, LayoutGrid, List, Package, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { formatUsd } from "../../lib/formatCurrency";
import { PORTAL_HERO, usePortalCatalog } from "../../hooks/portal/usePortalCatalog";
import { EmptyState, ErrorAlert, LoadingState, PageHeader, StatusChip } from "../common";
import { usePortalCatalogSearch } from "./PortalCatalogSearchContext";
import { useCart } from "./cartContext";

export function PortalCatalogView() {
  const { equipment } = usePortalCatalog();
  const { add } = useCart();
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
      const hay = `${item.name ?? ""} ${item.brandName ?? ""} ${item.categoryName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [equipment.data, search, categoryKey]);

  if (equipment.isLoading) {
    return <LoadingState message="Loading catalog…" />;
  }
  if (equipment.error) {
    return <ErrorAlert message="Failed to load catalog. Please try again." sx={{ mb: 2 }} />;
  }

  return (
    <Box>
      <PageHeader title={PORTAL_HERO.title} subtitle={PORTAL_HERO.body} />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
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
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
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
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell align="right">Daily rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" width={160} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{item.brandName}</TableCell>
                  <TableCell align="right">{formatUsd(item.dailyRate ?? 0)}</TableCell>
                  <TableCell>
                    <StatusChip status={item.isAvailable ? "available" : "unavailable"} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant={item.isAvailable ? "containedBlack" : "outlined"}
                      size="small"
                      disabled={!item.isAvailable}
                      startIcon={item.isAvailable ? <ShoppingCart size={16} aria-hidden /> : undefined}
                      onClick={() =>
                        add({
                          equipmentId: item.id ?? 0,
                          name: item.name ?? "",
                          dailyRate: item.dailyRate ?? 0,
                        })
                      }
                    >
                      {item.isAvailable ? "Add to order" : "Unavailable"}
                    </Button>
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
              featured && filtered.length > 1 ? { xs: 12, md: 8 } : featured && filtered.length === 1 ? { xs: 12, md: 12 } : { xs: 12, sm: 6, md: 4 };
            return (
              <Grid key={item.id} size={gridSize}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: featured ? { xs: "column", md: "row" } : "column",
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
                      }}
                    >
                      <Package size={72} strokeWidth={1} color="#94a3b8" aria-hidden />
                    </Box>
                  ) : null}
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <StatusChip status={item.isAvailable ? "available" : "unavailable"} />
                      <IconButton size="small" aria-label="Save to favorites (coming soon)" disabled>
                        <Heart size={18} aria-hidden />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: featured ? 2 : 1 }}>
                      {item.categoryName} · {item.brandName}
                    </Typography>
                    {featured ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                        Reliable rental unit with transparent daily pricing. Add to your order to reserve dates at
                        checkout.
                      </Typography>
                    ) : null}
                    {featured ? (
                      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 2 }}>
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
                      <Button
                        fullWidth={featured}
                        variant={item.isAvailable ? "containedBlack" : "outlined"}
                        size={featured ? "large" : "small"}
                        disabled={!item.isAvailable}
                        endIcon={item.isAvailable && featured ? <span aria-hidden>→</span> : undefined}
                        startIcon={item.isAvailable && !featured ? <ShoppingCart size={16} aria-hidden /> : undefined}
                        onClick={() =>
                          add({
                            equipmentId: item.id ?? 0,
                            name: item.name ?? "",
                            dailyRate: item.dailyRate ?? 0,
                          })
                        }
                      >
                        {item.isAvailable ? "Add to order" : "Unavailable"}
                      </Button>
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
