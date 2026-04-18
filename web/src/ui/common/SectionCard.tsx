import { Card, CardContent, Typography, type CardProps } from "@mui/material";
import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  children: ReactNode;
  headerRight?: ReactNode;
} & Pick<CardProps, "sx" | "variant">;

export function SectionCard({
  title,
  children,
  headerRight,
  sx,
  variant = "outlined",
}: SectionCardProps) {
  const hasHeader = title || headerRight;
  return (
    <Card variant={variant} sx={{ borderRadius: 2, ...sx }}>
      {hasHeader ? (
        <CardContent
          sx={{
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {title ? (
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          ) : (
            <span />
          )}
          {headerRight}
        </CardContent>
      ) : null}
      <CardContent sx={{ pt: hasHeader ? 0 : undefined }}>
        {children}
      </CardContent>
    </Card>
  );
}
