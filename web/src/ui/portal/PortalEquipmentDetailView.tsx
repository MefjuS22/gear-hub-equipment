import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Package } from "lucide-react";

import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiEquipmentId } from "../../api/generated/react-query";
import { formatUsd } from "../../lib/formatCurrency";
import { resolveMediaSrc } from "../../lib/resolveMediaSrc";
import { useCart } from "./cartContext";
import { ErrorAlert, LoadingState } from "../common";

type Props = {
  equipmentId: number;
};

export function PortalEquipmentDetailView({ equipmentId }: Props) {
  const navigate = useNavigate();
  const { add } = useCart();
  const detail = useGetApiEquipmentId(equipmentId, {
    client: gearhubApiClientOptions,
    query: { enabled: Number.isFinite(equipmentId) && equipmentId > 0 },
  });

  if (detail.isLoading) {
    return <LoadingState message="Loading equipment…" />;
  }

  if (detail.error || !detail.data?.id) {
    return (
      <Box>
        <ErrorAlert
          message="Could not load this equipment item."
          sx={{ mb: 2 }}
        />
        <Button
          component={Link}
          to="/portal"
          startIcon={<ArrowLeft size={18} aria-hidden />}
          variant="outlined"
        >
          Back to catalog
        </Button>
      </Box>
    );
  }

  const e = detail.data;
  const id = e.id ?? 0;
  const name = e.name ?? "Equipment";
  const img = resolveMediaSrc(e.imageUrl);
  const available = !!e.isAvailable;
  const dailyRate = e.dailyRate ?? 0;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }} aria-label="Breadcrumb">
        <Link to="/portal" style={{ textDecoration: "none", color: "inherit" }}>
          Catalog
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
      </Breadcrumbs>

      <Card variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            width: "100%",
            minHeight: 220,
            bgcolor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {img ? (
            <Box
              component="img"
              src={img}
              alt=""
              sx={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <Package size={72} strokeWidth={1} color="#94a3b8" aria-hidden />
          )}
        </Box>
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
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>
              {name}
            </Typography>
            <Chip
              label={available ? "Available" : "Unavailable"}
              color={available ? "success" : "default"}
              size="small"
              variant={available ? "filled" : "outlined"}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Unit #{id}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {formatUsd(dailyRate)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              / day
            </Typography>
          </Box>

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Catalog
          </Typography>
          <Typography variant="body2">
            <strong>Category:</strong> {e.categoryName ?? "—"} (ID{" "}
            {e.categoryId ?? "—"})
          </Typography>
          <Typography variant="body2">
            <strong>Brand:</strong> {e.brandName ?? "—"} (ID {e.brandId ?? "—"})
          </Typography>
          <Typography variant="body2">
            <strong>Warehouse:</strong> {e.warehouseName ?? "—"} (ID{" "}
            {e.warehouseId ?? "—"})
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
            <Button
              variant="containedBlack"
              disabled={!available}
              onClick={() => {
                if (available) {
                  add({ equipmentId: id, name, dailyRate });
                }
              }}
            >
              Add to order
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} aria-hidden />}
              onClick={() => {
                void navigate({ to: "/portal" });
              }}
            >
              Back
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
