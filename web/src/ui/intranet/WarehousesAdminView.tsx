import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { Pencil, PlusCircle, Trash2, Warehouse } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { WarehouseLookupDto } from "../../api/generated/types";
import { useWarehousesAdmin } from "../../hooks/intranet/useWarehousesAdmin";
import {
  warehouseFormSchema,
  type WarehouseFormValues,
} from "../../lib/formSchemas";
import { EmptyState, LoadingState, PageHeader, TablePaginationBar } from "../common";

export function WarehousesAdminView() {
  const {
    list,
    create,
    update,
    remove,
    items,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
  } = useWarehousesAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WarehouseLookupDto | null>(null);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseFormSchema),
    defaultValues: { name: "", location: "" },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", location: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: WarehouseLookupDto) => {
    setEditing(row);
    form.reset({
      name: row.name ?? "",
      location: row.location ?? "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const pending = create.isPending || update.isPending || remove.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const id = editing?.id;
    const payload = {
      name: values.name,
      location: values.location,
    };
    if (id != null) {
      update.mutate({ id, data: payload }, { onSuccess: () => closeDialog() });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => closeDialog() });
    }
  });

  if (list.isLoading) {
    return <LoadingState message="Loading warehouses…" />;
  }

  const rows = items;

  return (
    <Box>
      <PageHeader
        title="Warehouses"
        subtitle="Physical storage locations used when assigning equipment."
        actions={
          <Button
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
            onClick={openCreate}
          >
            Add warehouse
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No warehouses yet"
          description="Create warehouses to track where each piece of equipment is stored."
          icon={Warehouse}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell align="right" width={200} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.location}</TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "inline-flex",
                        gap: 1,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Pencil size={16} aria-hidden />}
                        disabled={w.id == null}
                        onClick={() => openEdit(w)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Trash2 size={16} aria-hidden />}
                        disabled={w.id == null}
                        onClick={() => {
                          if (w.id == null) return;
                          if (
                            !window.confirm(
                              "Delete this warehouse? It cannot be removed while still used by equipment.",
                            )
                          ) {
                            return;
                          }
                          remove.mutate({ id: w.id });
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
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

      <Dialog
        open={dialogOpen}
        onClose={() => !pending && closeDialog()}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editing ? "Edit warehouse" : "New warehouse"}
        </DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <DialogContent>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  autoFocus
                  label="Name"
                  required
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Location"
                  required
                  fullWidth
                  margin="dense"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => closeDialog()} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" variant="containedBlack" disabled={pending}>
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
