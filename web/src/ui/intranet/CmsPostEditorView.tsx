import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useCmsPostsAdmin } from "../../hooks/intranet/useCmsPostsAdmin";
import {
  CMS_POST_FORM_DEFAULTS,
  cmsPostDetailToFormValues,
} from "../../lib/cmsPostForm";
import {
  cmsPostFormSchema,
  type CmsPostFormValues,
} from "../../lib/formSchemas";
import type {
  CmsPostDetailDto,
  CmsPostUpsertDto,
} from "../../api/generated/types";
import { resolvePublicFileUrl, uploadFile } from "../../api/uploadFile";
import { ImageUrlField, PageHeader, RichTextEditor } from "../common";

type CmsPostEditorViewProps =
  | {
      mode: "create";
      initialValues?: CmsPostFormValues;
    }
  | {
      mode: "edit";
      postId: string;
      post: CmsPostDetailDto;
    };

export function CmsPostEditorView(props: CmsPostEditorViewProps) {
  const navigate = useNavigate();
  const { create, update } = useCmsPostsAdmin();

  const initialValues =
    props.mode === "create"
      ? (props.initialValues ?? CMS_POST_FORM_DEFAULTS)
      : cmsPostDetailToFormValues(props.post);

  const form = useForm<CmsPostFormValues>({
    resolver: zodResolver(cmsPostFormSchema),
    defaultValues: initialValues,
    values: initialValues,
  });

  const pending = create.isPending || update.isPending;

  const goBack = () => {
    void navigate({ to: "/intranet/portal-texts" });
  };

  const buildPayload = (values: CmsPostFormValues): CmsPostUpsertDto => ({
    slug: values.slug.trim(),
    title: values.title.trim(),
    excerpt: values.excerpt.trim() || undefined,
    coverImageUrl: values.coverImageUrl.trim() || undefined,
    bodyHtml: values.bodyHtml,
    isPublished: values.isPublished,
  });

  const onSubmit = form.handleSubmit((values) => {
    const payload = buildPayload(values);
    if (props.mode === "create") {
      create.mutate(
        { data: payload },
        {
          onSuccess: () => {
            void goBack();
          },
        },
      );
    } else {
      update.mutate(
        { id: props.postId, data: payload },
        {
          onSuccess: () => {
            void goBack();
          },
        },
      );
    }
  });

  return (
    <Box>
      <PageHeader
        title={props.mode === "create" ? "New post" : "Edit post"}
        subtitle="Rich text articles appear on the customer portal when published."
        actions={
          <Button
            component={Link}
            to="/intranet/portal-texts"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowLeft size={18} aria-hidden />}
          >
            Back to list
          </Button>
        }
      />

      <Paper
        component="form"
        variant="outlined"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          <ImageUrlField
            control={form.control}
            name="coverImageUrl"
            label="Cover image (listing & article header)"
            uploadFolder="cms"
            disabled={pending}
            helperText="Optional hero image for the news list and article page."
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
                  onUploadImage={async (file) => {
                    const res = await uploadFile(file, "cms");
                    return resolvePublicFileUrl(res.publicPath ?? "");
                  }}
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
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", pt: 1 }}>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              disabled={pending}
              onClick={() => {
                void goBack();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="containedBlack" disabled={pending}>
              Save
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
