import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { FileText, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import type { CmsPostListDto } from "../../api/generated/types";
import { useGetApiCmspostId } from "../../api/generated/react-query";
import { useCmsPostsAdmin } from "../../hooks/intranet/useCmsPostsAdmin";
import { cmsPostFormSchema, type CmsPostFormValues } from "../../lib/formSchemas";
import { EmptyState, LoadingState, PageHeader, RichTextEditor } from "../common";

const PLACEHOLDER_CMS_ID = "00000000-0000-0000-0000-000000000000";

export function PortalTextsAdminView() {
  const { list, create, update, remove } = useCmsPostsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const detailQuery = useGetApiCmspostId(editingId ?? PLACEHOLDER_CMS_ID, {
    client: gearhubApiClientOptions,
    query: { enabled: dialogOpen && editingId != null },
  });

  const form = useForm<CmsPostFormValues>({
    resolver: zodResolver(cmsPostFormSchema),
    defaultValues: {
      slug: "",
      title: "",
      excerpt: "",
      bodyHtml: "<p></p>",
      isPublished: false,
    },
  });

  const openCreate = () => {
    setEditingId(null);
    form.reset({
      slug: "",
      title: "",
      excerpt: "",
      bodyHtml: "<p></p>",
      isPublished: false,
    });
    setDialogOpen(true);
  };

  const openEdit = (row: CmsPostListDto) => {
    if (row.id == null || row.id === "") return;
    setEditingId(String(row.id));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
  };

  useEffect(() => {
    if (!dialogOpen) return;
    if (editingId == null) return;
    const d = detailQuery.data;
    if (d?.id == null || String(d.id) !== editingId) return;
    form.reset({
      slug: d.slug ?? "",
      title: d.title ?? "",
      excerpt: d.excerpt ?? "",
      bodyHtml:
        d.bodyHtml && d.bodyHtml.trim().length > 0 ? d.bodyHtml : "<p></p>",
      isPublished: d.isPublished ?? false,
    });
  }, [dialogOpen, editingId, detailQuery.data, form]);

  const pending =
    create.isPending || update.isPending || remove.isPending;
  const detailLoading =
    dialogOpen && editingId != null && detailQuery.isLoading;

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      slug: values.slug.trim(),
      title: values.title.trim(),
      excerpt: values.excerpt.trim() || undefined,
      bodyHtml: values.bodyHtml,
      isPublished: values.isPublished,
    };
    if (editingId != null) {
      update.mutate(
        {
          id: editingId,
          data: payload,
        },
        { onSuccess: () => closeDialog() },
      );
    } else {
      create.mutate(
        { data: payload },
        { onSuccess: () => closeDialog() },
      );
    }
  });

  if (list.isLoading) {
    return <LoadingState message="Loading posts…" />;
  }

  const rows = list.data ?? [];

  return (
    <Box>
      <PageHeader
        title="Portal content (CMS)"
        subtitle="Create news and articles with rich text. Published posts appear under News on the customer portal."
        actions={
          <Button
            variant="containedBlack"
            startIcon={<PlusCircle size={18} aria-hidden />}
            onClick={openCreate}
          >
            New post
          </Button>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Add your first article to show it on the public portal once published."
          icon={FileText}
        />
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Published</TableCell>
                <TableCell align="right" width={200} />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      /portal/news/{row.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.isPublished ? "yes" : "draft"}</TableCell>
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
                        disabled={!row.id}
                        onClick={() => openEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Trash2 size={16} aria-hidden />}
                        disabled={!row.id}
                        onClick={() => {
                          if (!row.id) return;
                          if (
                            !window.confirm(
                              "Delete this post? This cannot be undone.",
                            )
                          ) {
                            return;
                          }
                          remove.mutate({ id: row.id });
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
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>{editingId != null ? "Edit post" : "New post"}</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <DialogContent>
            {detailLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
              >
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Title"
                      required
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="URL slug"
                      fullWidth
                      placeholder="auto-generated if empty"
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message ??
                        "Lowercase words separated by hyphens. Leave empty to derive from the title."
                      }
                    />
                  )}
                />
                <Controller
                  name="excerpt"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Excerpt"
                      fullWidth
                      multiline
                      minRows={2}
                      error={!!fieldState.error}
                      helperText={
                        fieldState.error?.message ??
                        "Short summary shown on the news listing."
                      }
                    />
                  )}
                />
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Body
                  </Typography>
                  <Controller
                    name="bodyHtml"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        disabled={pending}
                        error={!!fieldState.error}
                      />
                    )}
                  />
                  {form.formState.errors.bodyHtml ? (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {form.formState.errors.bodyHtml.message}
                    </Typography>
                  ) : null}
                </Box>
                <Controller
                  name="isPublished"
                  control={form.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(_, v) => field.onChange(v)}
                        />
                      }
                      label="Published (visible on the portal)"
                    />
                  )}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => closeDialog()} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="containedBlack"
              disabled={pending || detailLoading}
            >
              Save
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
