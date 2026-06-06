import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link } from "@tanstack/react-router";
import dayjs from "dayjs";
import { CheckCircle2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";
import {
  useCartCheckout,
  type PortalLastOrderSummary,
} from "../../hooks/portal/useCartCheckout";
import type { CustomerCheckoutOptionDto } from "../../api/generated/types";
import { formatUsd } from "../../lib/formatCurrency";
import { countRentalPeriodDays } from "../../lib/rentalPeriodDays";
import { usePortalTexts } from "../../hooks/portal/usePortalTexts";
import { useAuth } from "../../providers/AuthProvider";
import { EmptyState, ErrorAlert, PageHeader, SectionCard } from "../common";

const CHECKOUT_AUTH_REDIRECT = "/portal/cart";

function summaryEstimatedTotal(summary: PortalLastOrderSummary): number {
  const days = countRentalPeriodDays(summary.rentalStart, summary.rentalEnd);
  return (
    summary.lines.reduce((sum, l) => sum + l.dailyRate * l.quantity, 0) * days
  );
}

function OrderConfirmationSummary({
  summary,
  onDismiss,
}: {
  summary: PortalLastOrderSummary;
  onDismiss: () => void;
}) {
  const total = useMemo(() => summaryEstimatedTotal(summary), [summary]);
  const orderId = summary.order.id;
  const rentalDays = useMemo(
    () => countRentalPeriodDays(summary.rentalStart, summary.rentalEnd),
    [summary.rentalEnd, summary.rentalStart],
  );

  return (
    <Box>
      <PageHeader
        title="Order confirmed"
        subtitle={
          orderId != null
            ? `Order #${orderId} is confirmed.`
            : "Your order is confirmed."
        }
      />

      <Alert
        severity="success"
        icon={<CheckCircle2 size={22} aria-hidden />}
        sx={{ mb: 2 }}
      >
        Here is a summary of what you ordered.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Order details">
            {summary.order.orderDate ? (
              <Typography variant="body2" sx={{ mb: 1.5 }}>
                <strong>Placed:</strong>{" "}
                {dayjs(summary.order.orderDate).format("MMM D, YYYY h:mm A")}
              </Typography>
            ) : null}
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              <strong>Rental period:</strong>{" "}
              {dayjs(summary.rentalStart).format("MMM D, YYYY")} –{" "}
              {dayjs(summary.rentalEnd).format("MMM D, YYYY")}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Company</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.companyName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {summary.contactPerson}
            </Typography>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Equipment
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Daily rate</TableCell>
                      <TableCell align="right">Line total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.lines.map((l) => {
                      const line = l.dailyRate * l.quantity * rentalDays;
                      return (
                        <TableRow key={l.equipmentId}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {l.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{l.quantity}</TableCell>
                          <TableCell align="right">
                            {formatUsd(l.dailyRate)}
                          </TableCell>
                          <TableCell align="right">{formatUsd(line)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {formatUsd(total)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mt: 3 }}
      >
        <Button
          component={Link}
          to="/portal"
          variant="contained"
          color="primary"
          size="large"
        >
          Browse catalog
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="large"
          onClick={onDismiss}
        >
          Done
        </Button>
      </Stack>
    </Box>
  );
}

export function CartCheckoutView() {
  const { isAuthenticated } = useAuth();
  const { getPlain } = usePortalTexts();
  const {
    form,
    handleSubmitForm,
    lines,
    setQuantity,
    remove,
    submit,
    subtotal,
    orderSubmitError,
    lastPlacedOrderSummary,
    dismissLastPlacedOrderSummary,
    checkoutCompanies,
  } = useCartCheckout();

  const hasPlacedOrderSummary = lastPlacedOrderSummary != null;
  useEffect(() => {
    if (lines.length > 0 && hasPlacedOrderSummary) {
      dismissLastPlacedOrderSummary();
    }
  }, [lines.length, hasPlacedOrderSummary, dismissLastPlacedOrderSummary]);

  if (lines.length === 0) {
    if (lastPlacedOrderSummary) {
      return (
        <OrderConfirmationSummary
          summary={lastPlacedOrderSummary}
          onDismiss={dismissLastPlacedOrderSummary}
        />
      );
    }
    return (
      <Box>
        <PageHeader
          title="Checkout"
          subtitle="Add equipment from the catalog to get started."
        />
        <EmptyState
          title={getPlain("cart.empty.title")}
          description={getPlain("cart.empty.body")}
          icon={ShoppingCart}
        />
      </Box>
    );
  }

  const lineCount = lines.reduce((n, l) => n + l.quantity, 0);

  const inner = (
    <>
      <PageHeader
        title="Checkout"
        subtitle={
          isAuthenticated
            ? "Enter company details and rental dates."
            : "Sign in to complete your order."
        }
      />

      {orderSubmitError && isAuthenticated ? (
        <ErrorAlert message={orderSubmitError} sx={{ mb: 2 }} />
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          {isAuthenticated ? (
            <>
              <SectionCard title="Company details">
                {checkoutCompanies.length > 0 ? (
                  <Autocomplete
                    options={checkoutCompanies}
                    getOptionLabel={(option) => option.companyName ?? ""}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    onChange={(_, value: CustomerCheckoutOptionDto | null) => {
                      if (value) {
                        form.setValue("customerId", value.id, {
                          shouldValidate: true,
                        });
                        form.setValue("companyName", value.companyName ?? "", {
                          shouldValidate: true,
                        });
                        form.setValue(
                          "contactPerson",
                          value.contactPerson ?? "",
                          {
                            shouldValidate: true,
                          },
                        );
                      } else {
                        form.setValue("customerId", undefined);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Saved company"
                        placeholder="Select a company you used before"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />
                ) : null}
                <Controller
                  name="companyName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Company / organization"
                      autoComplete="organization"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{ mb: 2 }}
                      onChange={(event) => {
                        form.setValue("customerId", undefined);
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Controller
                  name="contactPerson"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Contact person"
                      autoComplete="name"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{ mb: 2 }}
                      onChange={(event) => {
                        form.setValue("customerId", undefined);
                        field.onChange(event);
                      }}
                    />
                  )}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Pick a saved company or enter a new one.
                </Typography>
              </SectionCard>

              <SectionCard title="Rental dates" sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  <Controller
                    name="rentalStart"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <DatePicker
                        label="Start date"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(d) =>
                          field.onChange(
                            d?.isValid() ? d.format("YYYY-MM-DD") : "",
                          )
                        }
                        slotProps={{
                          textField: {
                            name: field.name,
                            inputRef: field.ref,
                            onBlur: field.onBlur,
                            error: !!fieldState.error,
                            helperText: fieldState.error?.message,
                            sx: { flex: "1 1 200px" },
                          },
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="rentalEnd"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <DatePicker
                        label="End date"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(d) =>
                          field.onChange(
                            d?.isValid() ? d.format("YYYY-MM-DD") : "",
                          )
                        }
                        slotProps={{
                          textField: {
                            name: field.name,
                            inputRef: field.ref,
                            onBlur: field.onBlur,
                            error: !!fieldState.error,
                            helperText: fieldState.error?.message,
                            sx: { flex: "1 1 200px" },
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </SectionCard>
            </>
          ) : (
            <SectionCard title="Sign in to continue">
              <Alert severity="info" sx={{ mb: 2 }}>
                Your cart is saved in this browser. Sign in to enter company
                details and place the order.
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You need an account to place an order.
              </Typography>
              <Stack spacing={1.5}>
                <Link
                  to="/login"
                  search={{ redirect: CHECKOUT_AUTH_REDIRECT }}
                  style={{
                    textDecoration: "none",
                    width: "100%",
                    display: "block",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                  >
                    Sign in to place order
                  </Button>
                </Link>
                <Link
                  to="/register"
                  search={{ redirect: CHECKOUT_AUTH_REDIRECT }}
                  style={{
                    textDecoration: "none",
                    width: "100%",
                    display: "block",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                  >
                    Create account
                  </Button>
                </Link>
              </Stack>
            </SectionCard>
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card
            variant="outlined"
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent
              sx={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                  gap: 1,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Your cart
                </Typography>
                <Chip
                  size="small"
                  color="primary"
                  label={`${lineCount} items`}
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      <TableCell align="center" width={140}>
                        Qty
                      </TableCell>
                      <TableCell align="right">Daily rate</TableCell>
                      <TableCell align="right" width={56} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((l) => (
                      <TableRow key={l.equipmentId}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {l.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                setQuantity(l.equipmentId, l.quantity - 1)
                              }
                            >
                              <Minus size={16} aria-hidden />
                            </IconButton>
                            <Typography
                              variant="body2"
                              sx={{
                                minWidth: 28,
                                textAlign: "center",
                                fontWeight: 600,
                              }}
                            >
                              {l.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              aria-label="Increase quantity"
                              onClick={() =>
                                setQuantity(l.equipmentId, l.quantity + 1)
                              }
                            >
                              <Plus size={16} aria-hidden />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatUsd(l.dailyRate)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            size="small"
                            aria-label="Remove line"
                            onClick={() => remove(l.equipmentId)}
                          >
                            <Trash2 size={18} aria-hidden />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 1 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  mb: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {formatUsd(subtotal)}
                </Typography>
              </Box>

              <Box sx={{ mt: "auto" }}>
                {isAuthenticated ? (
                  <Button
                    type="submit"
                    variant="containedBlack"
                    size="large"
                    fullWidth
                    disabled={submit.isPending}
                    endIcon={<span aria-hidden>→</span>}
                  >
                    Place order
                  </Button>
                ) : (
                  <Stack spacing={1.5}>
                    <Link
                      to="/login"
                      search={{ redirect: CHECKOUT_AUTH_REDIRECT }}
                      style={{
                        textDecoration: "none",
                        width: "100%",
                        display: "block",
                      }}
                    >
                      <Button
                        variant="containedBlack"
                        size="large"
                        fullWidth
                        endIcon={<span aria-hidden>→</span>}
                      >
                        Sign in to place order
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      search={{ redirect: CHECKOUT_AUTH_REDIRECT }}
                      style={{
                        textDecoration: "none",
                        width: "100%",
                        display: "block",
                      }}
                    >
                      <Button variant="outlined" size="large" fullWidth>
                        Create account
                      </Button>
                    </Link>
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );

  return isAuthenticated ? (
    <Box component="form" onSubmit={handleSubmitForm} noValidate>
      {inner}
    </Box>
  ) : (
    <Box>{inner}</Box>
  );
}
