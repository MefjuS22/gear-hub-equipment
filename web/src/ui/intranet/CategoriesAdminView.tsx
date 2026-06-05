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
import { FolderTree, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { CategoryLookupDto } from "../../api/generated/types";
import { useCategoriesAdmin } from "../../hooks/intranet/useCategoriesAdmin";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "../../lib/formSchemas";
import { EmptyState, LoadingState, PageHeader, TablePaginationBar } from "../common";

export function CategoriesAdminView() {
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
  } = useCategoriesAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryLookupDto | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", description: "" },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (row: CategoryLookupDto) => {
    setEditing(row);
    form.reset({
      name: row.name ?? "",
      description: row.description ?? "",
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
      description: values.description,
    };
    if (id != null) {
      update.mutate({ id, data: payload }, { onSuccess: () => closeDialog() });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => closeDialog() });
    }
  });

  if (list.isLoading) {
    return <LoadingState message="Loading categories…" />;
  }

  const rows = items;

  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle="Organize equipment into browseable groups for the portal and intranet."
        actions={
          <Button
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
            onClick={openCreate}
          >
            Add category
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Create categories to classify equipment and improve catalog navigation."
          icon={FolderTree}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right" width={200} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell sx={{ maxWidth: 360 }}>{c.description}</TableCell>
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
                        disabled={c.id == null}
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Trash2 size={16} aria-hidden />}
                        disabled={c.id == null}
                        onClick={() => {
                          if (c.id == null) return;
                          if (
                            !window.confirm(
                              "Delete this category? It cannot be removed while still used by equipment.",
                            )
                          ) {
                            return;
                          }
                          remove.mutate({ id: c.id });
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
        <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
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
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  margin="dense"
                  multiline
                  minRows={3}
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
