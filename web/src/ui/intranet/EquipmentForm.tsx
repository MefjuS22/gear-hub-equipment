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
import type { LucideIcon } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { BrandLookupDto, CategoryLookupDto } from "../../api/generated/types";
import type { WarehouseOption } from "../../lib/warehouseOptionsFromEquipment";
import type { EquipmentFormValues } from "../../lib/formSchemas";

type EquipmentFormProps = {
  control: Control<EquipmentFormValues>;
  categories: CategoryLookupDto[] | undefined;
  brands: BrandLookupDto[] | undefined;
  warehouses: WarehouseOption[];
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
  SubmitIcon: LucideIcon;
  cancelTo: string;
};

export function EquipmentForm({
  control,
  categories,
  brands,
  warehouses,
  onSubmit,
  isPending,
  submitLabel,
  SubmitIcon,
  cancelTo,
}: EquipmentFormProps) {
  return (
    <Paper
      component="form"
      variant="outlined"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
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
        control={control}
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
          control={control}
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
              {categories?.map((c) => (
                <MenuItem key={c.id} value={c.id ?? 0}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="brandId"
          control={control}
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
              {brands?.map((b) => (
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
        control={control}
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
              <MenuItem value={1}>Warehouse #1 (add equipment in DB first)</MenuItem>
            )}
          </TextField>
        )}
      />
      <Controller
        name="dailyRate"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            label="Daily rate (USD)"
            type="number"
            fullWidth
            slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
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
        control={control}
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
          disabled={isPending}
          startIcon={<SubmitIcon size={18} aria-hidden />}
        >
          {submitLabel}
        </Button>
        <Button component={Link} to={cancelTo} variant="outlined" disabled={isPending}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}
