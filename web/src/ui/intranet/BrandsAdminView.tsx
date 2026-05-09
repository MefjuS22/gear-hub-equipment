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
import { Pencil, PlusCircle, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useBrandsAdmin } from "../../hooks/intranet/useBrandsAdmin";
import { brandFormSchema, type BrandFormValues } from "../../lib/formSchemas";
import { EmptyState, LoadingState, PageHeader } from "../common";
import type { BrandLookupDto } from "../../api/generated/types";

export function BrandsAdminView() {
  const { list, create, update, remove } = useBrandsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BrandLookupDto | null>(null);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: { name: "" },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: BrandLookupDto) => {
    setEditing(row);
    form.reset({ name: row.name ?? "" });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const pending =
    create.isPending || update.isPending || remove.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const id = editing?.id;
    if (id != null) {
      update.mutate(
        { id, data: { name: values.name } },
        { onSuccess: () => closeDialog() },
      );
    } else {
      create.mutate(
        { data: { name: values.name } },
        { onSuccess: () => closeDialog() },
      );
    }
  });

  if (list.isLoading) {
    return <LoadingState message="Loading brands…" />;
  }

  const rows = list.data ?? [];

  return (
    <Box>
      <PageHeader
        title="Brands"
        subtitle="Manage equipment manufacturer labels used across the catalog."
        actions={
          <Button
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
            onClick={openCreate}
          >
            Add brand
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No brands yet"
          description="Create a brand to assign it to equipment in the inventory."
          icon={Tag}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right" width={200} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.name}</TableCell>
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
                        disabled={b.id == null}
                        onClick={() => openEdit(b)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Trash2 size={16} aria-hidden />}
                        disabled={b.id == null}
                        onClick={() => {
                          if (b.id == null) return;
                          if (
                            !window.confirm(
                              "Delete this brand? It cannot be removed while still used by equipment.",
                            )
                          ) {
                            return;
                          }
                          remove.mutate({ id: b.id });
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

      <Dialog
        open={dialogOpen}
        onClose={() => !pending && closeDialog()}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editing ? "Edit brand" : "New brand"}</DialogTitle>
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
