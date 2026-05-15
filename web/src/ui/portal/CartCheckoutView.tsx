import {
  Alert,
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
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { formatUsd } from "../../lib/formatCurrency";
import { useCartCheckout } from "../../hooks/portal/useCartCheckout";
import { useAuth } from "../../providers/AuthProvider";
import { EmptyState, ErrorAlert, PageHeader, SectionCard } from "../common";

/** After login or register from checkout, return here (cart is persisted). */
const CHECKOUT_AUTH_REDIRECT = "/portal/cart";

export function CartCheckoutView() {
  const { isAuthenticated } = useAuth();
  const {
    form,
    handleSubmitForm,
    lines,
    setQuantity,
    remove,
    submit,
    subtotal,
    orderSubmitError,
  } = useCartCheckout();

  if (lines.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Order builder"
          subtitle="Configure client details and rental parameters, then confirm your equipment cart."
        />
        <EmptyState
          title="Your cart is empty"
          description="Add items from the catalog to build a rental order."
          icon={ShoppingCart}
        />
      </Box>
    );
  }

  const lineCount = lines.reduce((n, l) => n + l.quantity, 0);

  const inner = (
    <>
      <PageHeader
        title="Order builder"
        subtitle={
          isAuthenticated
            ? "Configure client details and rental parameters."
            : "Sign in to enter order details and confirm your rental."
        }
      />

      {orderSubmitError && isAuthenticated ? (
        <ErrorAlert message={orderSubmitError} sx={{ mb: 2 }} />
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          {isAuthenticated ? (
            <>
              <SectionCard title="Client information">
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
                    />
                  )}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  We&apos;ll create a customer record for this rental. The order
                  is placed under your signed-in account.
                </Typography>
              </SectionCard>

              <SectionCard title="Rental parameters" sx={{ mt: 2 }}>
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
                Your cart is saved in this browser. After you sign in, you can
                add client details and submit the order.
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Rental orders must be tied to a signed-in account. Sign in or create
                an account to continue.
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
                  <Button variant="outlined" color="primary" size="large" fullWidth>
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
                  Equipment cart
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
                      <TableCell align="right">Rate / day</TableCell>
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
                          <Typography variant="caption" color="text.secondary">
                            ID #{l.equipmentId}
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
                  Estimated total (simplified)
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
                    Confirm rental order
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
