import { Box, Button, TextField } from "@mui/material";
import { ImagePlus } from "lucide-react";
import { useSnackbar } from "notistack";
import { useRef } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { uploadFile, type UploadFolder } from "../../api/uploadFile";
import { resolveMediaSrc } from "../../lib/resolveMediaSrc";

type ImageUrlFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  uploadFolder: UploadFolder;
  disabled?: boolean;
  helperText?: string;
};

export function ImageUrlField<T extends FieldValues>({
  control,
  name,
  label,
  uploadFolder,
  disabled = false,
  helperText,
}: ImageUrlFieldProps<T>) {
  const { enqueueSnackbar } = useSnackbar();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const preview = resolveMediaSrc(field.value as string | undefined);
        return (
          <Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <TextField
                label={label}
                fullWidth
                sx={{ flex: "1 1 240px" }}
                value={(field.value as string) ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                inputRef={field.ref}
                disabled={disabled}
                error={!!fieldState.error}
                helperText={fieldState.error?.message ?? helperText}
                placeholder="/files/… or https://…"
              />
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file || disabled) return;
                  try {
                    const res = await uploadFile(file, uploadFolder);
                    field.onChange(res.publicPath ?? res.absoluteUrl ?? "");
                  } catch {
                    enqueueSnackbar("Image upload failed.", { variant: "error" });
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<ImagePlus size={18} aria-hidden />}
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                sx={{ flexShrink: 0, mt: 0.5 }}
              >
                Upload
              </Button>
            </Box>
            {preview ? (
              <Box
                component="img"
                src={preview}
                alt=""
                sx={{
                  mt: 1,
                  maxWidth: "100%",
                  maxHeight: 160,
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  objectFit: "contain",
                  bgcolor: "action.hover",
                }}
              />
            ) : null}
          </Box>
        );
      }}
    />
  );
}
