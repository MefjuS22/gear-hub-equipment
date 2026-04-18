import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
} from "@mui/material";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { Controller } from "react-hook-form";
import { useEquipmentCreate } from "../../hooks/intranet/useEquipmentCreate";
import { LoadingState, PageHeader } from "../common";

export function EquipmentCreateView() {
  const {
    categories,
    brands,
    warehouses,
    create,
    form,
    handleSubmitForm,
    isLoading,
  } = useEquipmentCreate();

  if (isLoading) {
    return <LoadingState message="Loading form…" />;
  }

  return (
    <Box>
      <PageHeader
        title="Add equipment"
        subtitle="Create a new rental unit and assign category, brand, warehouse, and pricing."
        actions={
          <Button
            component={Link}
            to="/intranet/equipment"
            variant="outlined"
            startIcon={<ArrowLeft size={18} aria-hidden />}
          >
            Back to list
          </Button>
        }
      />
      <Paper
        component="form"
        variant="outlined"
        onSubmit={handleSubmitForm}
        noValidate
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 720,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Name"
              required
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Category"
                required
                sx={{ flex: "1 1 200px", minWidth: 0 }}
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
                required
                sx={{ flex: "1 1 200px", minWidth: 0 }}
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
        </Box>
        <Controller
          name="warehouseId"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              select
              label="Warehouse"
              required
              fullWidth
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
                <MenuItem value={1}>
                  Warehouse #1 (add equipment in DB first)
                </MenuItem>
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
              fullWidth
              name={field.name}
              inputRef={field.ref}
              value={field.value}
              onChange={e => field.onChange(Number(e.target.value))}
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
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, pt: 1 }}>
          <Button
            type="submit"
            variant="containedBlack"
            disabled={create.isPending}
            startIcon={<PlusCircle size={18} aria-hidden />}
          >
            Save equipment
          </Button>
          <Button
            component={Link}
            to="/intranet/equipment"
            variant="outlined"
            disabled={create.isPending}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
