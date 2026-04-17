import { Typography } from "@mui/material";

export function DashboardView() {
  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Dashboard
      </Typography>
      <Typography color="text.secondary">Staff home — pick a section from the menu.</Typography>
    </div>
  );
}
