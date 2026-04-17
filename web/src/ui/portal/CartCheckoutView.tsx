import {
  Box,
  Button,
  Card,
  CardContent,
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
import { CreditCard, ShoppingCart, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { formatUsd } from "../../lib/formatCurrency";
import { useCartCheckout } from "../../hooks/portal/useCartCheckout";
import { PORTAL_CHECKOUT_STAFF_USER_ID } from "../../lib/portalConstants";

export function CartCheckoutView() {
  const { form, handleSubmitForm, lines, setQuantity, remove, customers, submit, subtotal } =
    useCartCheckout();

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <ShoppingCart size={28} strokeWidth={1.75} aria-hidden />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: "primary.main" }}>
          Cart & checkout
        </Typography>
      </Box>
      {lines.length === 0 ? (
        <Typography color="text.secondary">Your cart is empty — add items from the catalog.</Typography>
      ) : (
        <>
          <TableContainer component={Card} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Equipment</TableCell>
                  <TableCell align="right">Rate / day</TableCell>
                  <TableCell width={120}>Qty</TableCell>
                  <TableCell width={100} align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.equipmentId}>
                    <TableCell>{l.name}</TableCell>
                    <TableCell align="right">{formatUsd(l.dailyRate)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        slotProps={{ htmlInput: { min: 1 } }}
                        value={l.quantity}
                        onChange={(e) => setQuantity(l.equipmentId, Number(e.target.value))}
                        sx={{ width: 88 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        color="error"
                        size="small"
                        variant="outlined"
                        startIcon={<Trash2 size={16} aria-hidden />}
                        onClick={() => remove(l.equipmentId)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Card variant="outlined" component="form" onSubmit={handleSubmitForm} noValidate>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Controller
                name="customerId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    select
                    label="Customer"
                    disabled={customers.isLoading || !customers.data?.length}
                    value={field.value}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                    inputRef={field.ref}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  >
                    {(customers.data ?? []).map((c) => (
                      <MenuItem key={c.id} value={c.id ?? 0}>
                        {c.companyName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Typography variant="caption" color="text.secondary">
                The order will be assigned to system user ID {PORTAL_CHECKOUT_STAFF_USER_ID} — the generated API
                does not expose user endpoints yet.
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                <Controller
                  name="rentalStart"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Rental start"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{ flex: "1 1 200px" }}
                    />
                  )}
                />
                <Controller
                  name="rentalEnd"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Rental end"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      sx={{ flex: "1 1 200px" }}
                    />
                  )}
                />
              </Box>
              <Box>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Estimated total (simplified): <strong>{formatUsd(subtotal)}</strong>
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={submit.isPending}
                  startIcon={<CreditCard size={18} aria-hidden />}
                >
                  Place order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
