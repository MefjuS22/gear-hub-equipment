import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
  usePortalTextDetail,
  usePortalTextsAdmin,
} from "../../hooks/intranet/usePortalTextsAdmin";
import {
  portalTextFormSchema,
  type PortalTextFormValues,
} from "../../lib/formSchemas";
import { resolvePortalTextBodyHtml } from "../../lib/portalTextDefaults";
import { resolvePublicFileUrl, uploadFile } from "../../api/uploadFile";
import { LoadingState, PageHeader, RichTextEditor } from "../common";
import { PortalTextPagePreview } from "./PortalTextPagePreview";
import { PortalTextsSectionNav } from "./PortalTextsSectionNav";

type PortalStaticTextEditorViewProps = {
  textKey: string;
};

export function PortalStaticTextEditorView({
  textKey,
}: PortalStaticTextEditorViewProps) {
  const navigate = useNavigate();
  const { update } = usePortalTextsAdmin();
  const detail = usePortalTextDetail(textKey);

  const form = useForm<PortalTextFormValues>({
    resolver: zodResolver(portalTextFormSchema),
    defaultValues: { title: "", bodyHtml: "" },
  });

  useEffect(() => {
    if (!detail.data?.key) {
      return;
    }
    form.reset({
      title: detail.data.title ?? "",
      bodyHtml: resolvePortalTextBodyHtml(textKey, detail.data.bodyHtml),
    });
  }, [detail.data, form, textKey]);

  const watchedBodyHtml = useWatch({
    control: form.control,
    name: "bodyHtml",
    defaultValue: "",
  });

  if (detail.isLoading) {
    return <LoadingState message="Loading portal text…" />;
  }

  if (detail.isError || !detail.data?.key) {
    return (
      <Box>
        <PageHeader title="Portal text not found" />
        <Button
          component={Link}
          to="/intranet/portal-texts/static"
          startIcon={<ArrowLeft size={18} aria-hidden />}
        >
          Back to portal texts
        </Button>
      </Box>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    update.mutate(
      {
        key: textKey,
        data: {
          title: values.title.trim(),
          bodyHtml: values.bodyHtml,
        },
      },
      {
        onSuccess: () => {
          void navigate({ to: "/intranet/portal-texts/static" });
        },
      },
    );
  });

  return (
    <Box>
      <PageHeader
        title={detail.data.title ?? "Edit portal text"}
        subtitle={detail.data.placementHint ?? undefined}
        actions={
          <Button
            component={Link}
            to="/intranet/portal-texts/static"
            variant="outlined"
            color="inherit"
            startIcon={<ArrowLeft size={18} aria-hidden />}
          >
            Back to list
          </Button>
        }
      />
      <PortalTextsSectionNav />

      <Paper
        component="form"
        variant="outlined"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit();
        }}
        sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Staff label"
                required
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ??
                  "Shown in the intranet list only — not on the public portal."
                }
              />
            )}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Portal content
            </Typography>
            <Controller
              name="bodyHtml"
              control={form.control}
              render={({ field, fieldState }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  disabled={update.isPending}
                  error={!!fieldState.error}
                  placeholder="Write the text shown on the customer portal…"
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

          <Box sx={{ display: "flex", gap: 1.5, pt: 1 }}>
            <Button
              type="submit"
              variant="containedBlack"
              disabled={update.isPending}
              startIcon={<Save size={18} aria-hidden />}
            >
              {update.isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              component={Link}
              to="/intranet/portal-texts/static"
              variant="outlined"
              disabled={update.isPending}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      <PortalTextPagePreview
        textKey={textKey}
        bodyHtml={watchedBodyHtml ?? ""}
      />
    </Box>
  );
}
