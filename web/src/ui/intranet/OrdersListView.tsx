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
import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { useOrdersList } from "../../hooks/intranet/useOrdersList";
import { canViewIntranetOrderDetail } from "../../lib/intranetOrderAccess";
import { useAuth } from "../../providers/AuthProvider";
import { EmptyState, LoadingState, PageHeader, TablePaginationBar } from "../common";
import {
  formatOrderDateTime,
  formatOrderLinesSummary,
} from "./orderDisplayFormat";

export function OrdersListView() {
  const { list, items, page, setPage, pageSize, setPageSize, totalCount } =
    useOrdersList();
  const { user } = useAuth();

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

  const rows = items;

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
                  <TableCell>
                    {o.id != null && canViewIntranetOrderDetail(user, o) ? (
                      <Link
                        to="/intranet/orders/$orderId"
                        params={{ orderId: String(o.id) }}
                        style={{
                          fontWeight: 700,
                          textDecoration: "underline",
                          textUnderlineOffset: 3,
                          color: "inherit",
                        }}
                      >
                        {o.id}
                      </Link>
                    ) : (
                      o.id
                    )}
                  </TableCell>
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
                    {formatOrderDateTime(o.orderDate)}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatOrderDateTime(o.rentalStartDate)} →{" "}
                    {formatOrderDateTime(o.rentalEndDate)}
                  </TableCell>
                  <TableCell
                    sx={{
                      typography: "body2",
                      color: "text.secondary",
                      maxWidth: 420,
                    }}
                  >
                    {formatOrderLinesSummary(o)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TablePaginationBar
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Box>
  );
}
