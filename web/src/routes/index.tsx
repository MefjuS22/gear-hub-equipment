import { createFileRoute, Link } from "@tanstack/react-router";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Building2, Store } from "lucide-react";
import { HomeLayout } from "../ui/shells/HomeLayout";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <HomeLayout>
      <Box sx={{ p: { xs: 2, sm: 4 }, flex: 1 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}
        >
          Welcome
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 560 }}
        >
          Precision rental operations — choose where to go next.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "primary.main",
                }}
              >
                <Store size={28} strokeWidth={1.75} aria-hidden />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Client portal
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Browse the equipment catalog, build your cart, and submit rental
                orders.
              </Typography>
              <Button
                component={Link}
                to="/portal"
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: "auto" }}
              >
                Open portal
              </Button>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "text.primary",
                }}
              >
                <Building2 size={28} strokeWidth={1.75} aria-hidden />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Staff workspace
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage equipment, reference data, and internal workflows.
              </Typography>
              <Button
                component={Link}
                to="/intranet"
                variant="outlined"
                color="inherit"
                size="large"
                sx={{ mt: "auto", borderColor: "divider" }}
              >
                Open staff app
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </HomeLayout>
  );
}
