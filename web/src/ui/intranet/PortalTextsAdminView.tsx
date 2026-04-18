import { Typography } from "@mui/material";
import { FileText } from "lucide-react";
import { EmptyState } from "../common";

export function PortalTextsAdminView() {
  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Portal content (CMS)
      </Typography>
      <EmptyState title="Coming soon" description="Edit portal copy and hero content from here when available." icon={FileText} />
    </div>
  );
}
