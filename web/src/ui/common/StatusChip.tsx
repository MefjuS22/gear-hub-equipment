import { Chip, type ChipProps } from "@mui/material";

export type AvailabilityStatus = "available" | "unavailable";

type StatusChipProps = {
  status: AvailabilityStatus;
  label?: string;
} & Omit<ChipProps, "label" | "color">;

export function StatusChip({
  status,
  label,
  size = "small",
  sx,
  ...rest
}: StatusChipProps) {
  const isAvailable = status === "available";
  return (
    <Chip
      size={size}
      label={label ?? (isAvailable ? "Available now" : "Unavailable")}
      sx={{
        fontWeight: 600,
        ...(isAvailable
          ? {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "& .MuiChip-label": { px: 1.25 },
            }
          : {
              bgcolor: "grey.200",
              color: "text.secondary",
            }),
        ...sx,
      }}
      {...rest}
    />
  );
}
