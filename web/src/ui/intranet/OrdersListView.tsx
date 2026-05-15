import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { ClipboardList } from "lucide-react";
import type { RentalOrderListDto } from "../../api/generated/types";
import { useOrdersList } from "../../hooks/intranet/useOrdersList";
import { formatUsd } from "../../lib/formatCurrency";
import { EmptyState, LoadingState, PageHeader } from "../common";

function formatDt(iso?: string | null) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return d.isValid() ? d.format("MMM D, YYYY HH:mm") : "—";
}

function linesSummary(order: RentalOrderListDto) {
  const items = order.items ?? [];
  if (items.length === 0) return "—";
  return items
    .map((line) => {
      const q = line.quantity ?? 0;
      const name = line.equipmentName ?? `#${line.equipmentId}`;
      const price = line.unitPrice != null ? formatUsd(line.unitPrice) : "—";
      return `${q}× ${name} @ ${price}`;
    })
    .join(" · ");
}

export function OrdersListView() {
  const { list } = useOrdersList();

  if (list.isLoading) {
    return <LoadingState message="Loading orders…" />;
  }

  if (list.isError) {
    return (
      <Box>
        <PageHeader
          title="Orders"
          subtitle="Rental orders placed through the checkout flow."
        />
        <Typography color="error" sx={{ mt: 2 }}>
          Could not load orders. Try again later.
        </Typography>
      </Box>
    );
  }

  const rows = list.data ?? [];

  return (
    <Box>
      <PageHeader
        title="Orders"
        subtitle="Rental orders placed through the checkout flow."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="When customers complete checkout, their orders will appear here."
          icon={ClipboardList}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Ordered</TableCell>
                <TableCell>Rental period</TableCell>
                <TableCell sx={{ minWidth: 280 }}>Lines</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>
                    {o.customerCompanyName}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      Customer #{o.customerId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {o.userName || "—"}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {o.userEmail || `User #${o.userId}`}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDt(o.orderDate)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDt(o.rentalStartDate)} → {formatDt(o.rentalEndDate)}
                  </TableCell>
                  <TableCell
                    sx={{
                      typography: "body2",
                      color: "text.secondary",
                      maxWidth: 420,
                    }}
                  >
                    {linesSummary(o)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
