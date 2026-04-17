import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { Package, ShoppingCart } from "lucide-react";
import { formatUsd } from "../../lib/formatCurrency";
import { PORTAL_HERO, usePortalCatalog } from "../../hooks/portal/usePortalCatalog";
import { useCart } from "./cartContext";

export function PortalCatalogView() {
  const { equipment } = usePortalCatalog();
  const { add } = useCart();

  if (equipment.isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (equipment.error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load catalog.
      </Alert>
    );
  }

  return (
    <Box>
      <Card variant="outlined" sx={{ mb: 3, bgcolor: "background.paper" }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: "primary.main" }}>
            {PORTAL_HERO.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {PORTAL_HERO.body}
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Package size={24} strokeWidth={1.75} aria-hidden />
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Equipment catalog
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {equipment.data?.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.categoryName} · {item.brandName}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>{formatUsd(item.dailyRate ?? 0)}</strong> / day
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
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
                  {item.isAvailable ? "Add to cart" : "Unavailable"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
