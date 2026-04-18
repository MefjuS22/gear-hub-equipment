import { Box, Typography, type TypographyProps } from "@mui/material";
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  titleVariant?: TypographyProps["variant"];
};

export function PageHeader({
  title,
  subtitle,
  actions,
  titleVariant = "h4",
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant={titleVariant}
          component="h1"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 0.5, maxWidth: 720 }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>
      ) : null}
    </Box>
  );
}
