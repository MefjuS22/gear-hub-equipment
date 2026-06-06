import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { ClipboardList, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCustomer } from "../../api/generated/react-query";
import { useOrderListUrl } from "../../hooks/intranet/useOrderListUrl";
import { useOrdersList } from "../../hooks/intranet/useOrdersList";
import { canViewIntranetOrderDetail } from "../../lib/intranetOrderAccess";
import { downloadAuthenticatedFile } from "../../lib/downloadAuthenticatedFile";
import {
  hasActiveOrderListFilters,
  orderListFilterToApiParams,
} from "../../lib/orderListSearch";
import { getPagedItems, LOOKUP_PAGE_SIZE } from "../../lib/pagination";
import { useAuth } from "../../providers/AuthProvider";
import {
  EmptyState,
  LoadingState,
  PageHeader,
  TablePaginationBar,
} from "../common";
import {
  formatOrderDateTime,
  formatOrderLinesSummary,
} from "./orderDisplayFormat";

export function OrdersListView() {
  const { search, setSearch, clearFilters } = useOrderListUrl();
  const { list, items, totalCount, isFiltering, apiSearch, page, pageSize } =
    useOrdersList(search);
  const { user } = useAuth();
  const [exportingPdf, setExportingPdf] = useState(false);

  const customers = useGetApiCustomer(
    { Page: 1, PageSize: LOOKUP_PAGE_SIZE },
    { client: gearhubApiClientOptions },
  );
  const customerOptions = useMemo(
    () => getPagedItems(customers.data),
    [customers.data],
  );

  const setPage = (nextPage: number) => setSearch({ page: nextPage + 1 });
  const setPageSize = (nextPageSize: number) =>
    setSearch({ pageSize: nextPageSize, page: 1 });

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
      await downloadAuthenticatedFile({
        path: "/api/Order/export/pdf",
        fileName: `gearhub-orders-${stamp}.pdf`,
        queryParams: orderListFilterToApiParams(apiSearch),
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const filtersActive = hasActiveOrderListFilters(search);
  const rows = items;

  if (list.isLoading && !list.data) {
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

  return (
    <Box sx={{ opacity: isFiltering || list.isFetching ? 0.72 : 1 }}>
      <PageHeader
        title="Orders"
        subtitle="Filter the list and export a PDF for the current selection."
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={16} aria-hidden />}
            disabled={exportingPdf}
            onClick={() => void handleExportPdf()}
          >
            Export PDF
          </Button>
        }
      />

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "2fr 1fr 1fr 1fr auto",
              },
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Search"
              placeholder="Order ID, customer, user…"
              value={search.q}
              onChange={(e) => setSearch({ q: e.target.value })}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} aria-hidden />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <DatePicker
              label="Ordered from"
              value={search.orderDateFrom ? dayjs(search.orderDateFrom) : null}
              onChange={(value) =>
                setSearch({
                  orderDateFrom: value?.isValid()
                    ? value.format("YYYY-MM-DD")
                    : "",
                })
              }
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <DatePicker
              label="Ordered to"
              value={search.orderDateTo ? dayjs(search.orderDateTo) : null}
              onChange={(value) =>
                setSearch({
                  orderDateTo: value?.isValid()
                    ? value.format("YYYY-MM-DD")
                    : "",
                })
              }
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="orders-customer-filter">Customer</InputLabel>
              <Select
                labelId="orders-customer-filter"
                label="Customer"
                value={search.customerId}
                onChange={(e) => setSearch({ customerId: e.target.value })}
              >
                <MenuItem value="all">All customers</MenuItem>
                {customerOptions.map((customer) => (
                  <MenuItem key={customer.id} value={String(customer.id ?? 0)}>
                    {customer.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="text"
              size="small"
              disabled={!filtersActive}
              onClick={clearFilters}
              sx={{ whiteSpace: "nowrap" }}
            >
              Clear filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title={filtersActive ? "No orders match" : "No orders yet"}
          description={
            filtersActive
              ? "Try different filters or clear them to see all orders."
              : "When customers complete checkout, their orders will appear here."
          }
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
