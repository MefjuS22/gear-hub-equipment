import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { Download, LogIn, Package, ShoppingCart, Users } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { useDashboardStats } from "../../hooks/intranet/useDashboardStats";
import { downloadAuthenticatedFile } from "../../lib/downloadAuthenticatedFile";
import type { DashboardChartPoint } from "../../lib/dashboardTypes";
import { formatUsd } from "../../lib/formatCurrency";
import { ErrorAlert, LoadingState } from "../common";

const CHART_HEIGHT = 250;

function chartSeries(points: DashboardChartPoint[]) {
  return {
    labels: points.map((point) => point.label),
    values: points.map((point) => point.value),
  };
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function DashboardStatsPanel() {
  const stats = useDashboardStats();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const ordersByDay = useMemo(
    () => chartSeries(stats.data?.ordersByDay ?? []),
    [stats.data?.ordersByDay],
  );
  const revenueByDay = useMemo(
    () => chartSeries(stats.data?.revenueByDay ?? []),
    [stats.data?.revenueByDay],
  );
  const topEquipment = useMemo(
    () => chartSeries(stats.data?.topEquipment ?? []),
    [stats.data?.topEquipment],
  );
  const loginsByDay = useMemo(
    () => chartSeries(stats.data?.loginsByDay ?? []),
    [stats.data?.loginsByDay],
  );

  if (stats.isLoading) {
    return <LoadingState message="Loading dashboard statistics…" />;
  }

  if (stats.isError || !stats.data) {
    return (
      <ErrorAlert message="Could not load dashboard statistics. Try again later." />
    );
  }

  const { summary } = stats.data;

  const handleExportExcel = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      await downloadAuthenticatedFile({
        path: "/api/Dashboard/export/excel",
        fileName: `gearhub-stats-${stamp}.xlsx`,
      });
    } catch {
      setExportError("Excel export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
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
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Statistics
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download size={16} aria-hidden />}
          disabled={exporting}
          onClick={() => void handleExportExcel()}
        >
          Export to Excel
        </Button>
      </Box>

      {exportError ? <ErrorAlert message={exportError} sx={{ mb: 2 }} /> : null}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            label="Orders (30 days)"
            value={String(summary.ordersLast30Days)}
            icon={<ShoppingCart size={18} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            label="Revenue est. (30 days)"
            value={formatUsd(summary.estimatedRevenueLast30Days)}
            icon={<Package size={18} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            label="Logins (24h)"
            value={String(summary.loginsLast24Hours)}
            icon={<LogIn size={18} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            label="Unique users (24h)"
            value={String(summary.uniqueUsersLoggedInLast24Hours)}
            icon={<Users size={18} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            label="Customers"
            value={String(summary.totalCustomers)}
            icon={<Users size={18} aria-hidden />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <KpiCard
            label="Equipment available"
            value={`${summary.availableEquipment}/${summary.totalEquipment}`}
            icon={<Package size={18} aria-hidden />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Orders per day (30 days)
              </Typography>
              <LineChart
                height={CHART_HEIGHT}
                xAxis={[
                  {
                    scaleType: "point",
                    data: ordersByDay.labels,
                    tickLabelStyle: { fontSize: 11 },
                  },
                ]}
                series={[
                  {
                    data: ordersByDay.values,
                    label: "Orders",
                    color: "#1976d2",
                    area: true,
                    showMark: false,
                  },
                ]}
                margin={{ left: 48, right: 16, top: 16, bottom: 32 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Estimated revenue per day (30 days)
              </Typography>
              <LineChart
                height={CHART_HEIGHT}
                xAxis={[
                  {
                    scaleType: "point",
                    data: revenueByDay.labels,
                    tickLabelStyle: { fontSize: 11 },
                  },
                ]}
                series={[
                  {
                    data: revenueByDay.values,
                    label: "Revenue",
                    color: "#2e7d32",
                    valueFormatter: (value) =>
                      value == null ? "" : formatUsd(value),
                  },
                ]}
                margin={{ left: 56, right: 16, top: 16, bottom: 32 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Top rented equipment (30 days)
              </Typography>
              <BarChart
                height={CHART_HEIGHT}
                layout="horizontal"
                yAxis={[
                  {
                    scaleType: "band",
                    data: topEquipment.labels,
                    tickLabelStyle: { fontSize: 11 },
                  },
                ]}
                series={[
                  {
                    data: topEquipment.values,
                    label: "Qty",
                    color: "#ed6c02",
                  },
                ]}
                margin={{ left: 120, right: 16, top: 16, bottom: 32 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Logins per day (7 days)
              </Typography>
              <LineChart
                height={CHART_HEIGHT}
                xAxis={[
                  {
                    scaleType: "point",
                    data: loginsByDay.labels,
                    tickLabelStyle: { fontSize: 11 },
                  },
                ]}
                series={[
                  {
                    data: loginsByDay.values,
                    label: "Logins",
                    color: "#9c27b0",
                  },
                ]}
                margin={{ left: 48, right: 16, top: 16, bottom: 32 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
