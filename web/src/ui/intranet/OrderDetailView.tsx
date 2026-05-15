import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { useOrderDetail } from "../../hooks/intranet/useOrderDetail";
import { formatApiErrorForDisplay, parseApiError } from "../../lib/apiError";
import { formatUsd } from "../../lib/formatCurrency";
import { ErrorAlert, LoadingState, PageHeader } from "../common";
import {
  formatOrderDateTime,
  formatOrderLinesSummary,
} from "./orderDisplayFormat";

type Props = {
  orderId: number;
};

export function OrderDetailView({ orderId }: Props) {
  const detail = useOrderDetail(orderId);

  if (detail.isLoading) {
    return <LoadingState message="Loading order…" />;
  }

  if (detail.isError) {
    const msg = formatApiErrorForDisplay(parseApiError(detail.error));
    return (
      <Box>
        <PageHeader title="Order" subtitle={`Order #${orderId}`} />
        <ErrorAlert message={msg} sx={{ mt: 2 }} />
        <Button component={Link} to="/intranet/orders" sx={{ mt: 2 }}>
          Back to orders
        </Button>
      </Box>
    );
  }

  const o = detail.data;
  if (!o) {
    return null;
  }

  const items = o.items ?? [];

  return (
    <Box>
      <PageHeader
        title={`Order #${o.id ?? orderId}`}
        subtitle="Rental order details"
        actions={
          <Button
            component={Link}
            to="/intranet/orders"
            variant="outlined"
            size="small"
          >
            All orders
          </Button>
        }
      />

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Customer:</strong> {o.customerCompanyName ?? "—"}{" "}
          <Typography component="span" variant="caption" color="text.secondary">
            (#{o.customerId})
          </Typography>
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Placed by:</strong> {o.userName || "—"} ({o.userEmail || "—"})
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Ordered:</strong> {formatOrderDateTime(o.orderDate)}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Rental period:</strong>{" "}
          {formatOrderDateTime(o.rentalStartDate)} →{" "}
          {formatOrderDateTime(o.rentalEndDate)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatOrderLinesSummary(o)}
        </Typography>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Equipment</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="right">Unit price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography variant="body2" color="text.secondary">
                    No line items.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((line) => (
                <TableRow key={`${line.equipmentId}-${line.quantity}`}>
                  <TableCell>
                    {line.equipmentName ?? `#${line.equipmentId}`}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      ID #{line.equipmentId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{line.quantity ?? "—"}</TableCell>
                  <TableCell align="right">
                    {line.unitPrice != null ? formatUsd(line.unitPrice) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
