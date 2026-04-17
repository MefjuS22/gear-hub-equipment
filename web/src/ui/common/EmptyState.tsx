import { Box, Button, Typography } from "@mui/material";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateAction = { label: string; onClick: () => void };

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: EmptyStateAction | ReactNode;
};

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: "center", maxWidth: 440, mx: "auto" }}>
      {Icon ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2, color: "text.secondary" }}>
          <Icon size={40} strokeWidth={1.5} aria-hidden />
        </Box>
      ) : null}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      ) : null}
      {action ? (
        typeof action === "object" && action !== null && "label" in action ? (
          <Button variant="contained" color="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : (
          action
        )
      ) : null}
    </Box>
  );
}
