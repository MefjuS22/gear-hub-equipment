import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  MenuItem,
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
import dayjs from "dayjs";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { formatUsd } from "../../lib/formatCurrency";
import { useCartCheckout } from "../../hooks/portal/useCartCheckout";
import { PORTAL_CHECKOUT_STAFF_USER_ID } from "../../lib/portalConstants";
import { EmptyState, PageHeader, SectionCard } from "../common";

export function CartCheckoutView() {
  const {
    form,
    handleSubmitForm,
    lines,
    setQuantity,
    remove,
    customers,
    submit,
    subtotal,
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

  return (
    <Box component="form" onSubmit={handleSubmitForm} noValidate>
      <PageHeader
        title="Order builder"
        subtitle="Configure client details and rental parameters."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard title="Client information">
            <Controller
              name="customerId"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  select
                  fullWidth
                  label="Customer"
                  disabled={customers.isLoading || !customers.data?.length}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  inputRef={field.ref}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  sx={{ mb: 2 }}
                >
                  {(customers.data ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id ?? 0}>
                      {c.companyName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Orders are assigned to system user ID{" "}
              {PORTAL_CHECKOUT_STAFF_USER_ID} until user APIs are available.
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
                      field.onChange(d?.isValid() ? d.format("YYYY-MM-DD") : "")
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
                      field.onChange(d?.isValid() ? d.format("YYYY-MM-DD") : "")
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
