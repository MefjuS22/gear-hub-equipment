import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { PlusCircle, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { formatUsd } from "../../lib/formatCurrency";
import { useEquipmentAdmin } from "../../hooks/intranet/useEquipmentAdmin";
import { LoadingState, PageHeader } from "../common";

export function EquipmentAdminView() {
  const { equipment, categories, brands, warehouses, remove, form, handleSubmitForm, create } =
    useEquipmentAdmin();

  if (equipment.isLoading) {
    return <LoadingState message="Loading equipment…" />;
  }

  return (
    <Box>
      <PageHeader
        title="Equipment inventory"
        subtitle="Manage and track your active rental fleet across warehouses."
        actions={
          <Button type="submit" form="equipment-create-form" variant="containedBlack" disabled={create.isPending} startIcon={<PlusCircle size={18} aria-hidden />}>
            Add equipment
          </Button>
        }
      />
      <Paper
        id="equipment-create-form"
        component="form"
        variant="outlined"
        onSubmit={handleSubmitForm}
        noValidate
        sx={{ p: 2, mb: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Name"
                size="small"
                sx={{ minWidth: 180, flex: "2 1 180px" }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Category"
                size="small"
                sx={{ minWidth: 140, flex: "1 1 120px" }}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {categories.data?.map((c) => (
                  <MenuItem key={c.id} value={c.id ?? 0}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="brandId"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Brand"
                size="small"
                sx={{ minWidth: 140, flex: "1 1 120px" }}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {brands.data?.map((b) => (
                  <MenuItem key={b.id} value={b.id ?? 0}>
                    {b.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="warehouseId"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Warehouse"
                size="small"
                sx={{ minWidth: 160, flex: "1 1 140px" }}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              >
                {warehouses.length > 0 ? (
                  warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id ?? 0}>
                      {w.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={1}>Warehouse #1 (add equipment in DB first)</MenuItem>
                )}
              </TextField>
            )}
          />
          <Controller
            name="dailyRate"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                label="Daily rate (USD)"
                type="number"
                size="small"
                slotProps={{ htmlInput: { step: "0.01" } }}
                sx={{ width: 120 }}
                name={field.name}
                inputRef={field.ref}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="isAvailable"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ mt: 0.5 }}
                control={
                  <Checkbox
                    checked={!!field.value}
                    onChange={(_, v) => field.onChange(v)}
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                  />
                }
                label="Available"
              />
            )}
          />
        </Box>
      </Paper>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Daily rate</TableCell>
              <TableCell>Available</TableCell>
              <TableCell align="right" width={100} />
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment.data?.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.name}</TableCell>
                <TableCell align="right">{e.dailyRate != null ? formatUsd(e.dailyRate) : "—"}</TableCell>
                <TableCell>{e.isAvailable ? "yes" : "no"}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<Trash2 size={16} aria-hidden />}
                    onClick={() => e.id != null && remove.mutate({ id: e.id })}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
