import {
  Badge,
  Box,
  Button,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { Search, ShoppingCart } from "lucide-react";

import type { PortalTextPreviewPage } from "../../lib/portalTextPreview";

type PortalPreviewChromeProps = {
  activePage: PortalTextPreviewPage;
};

function PreviewNavTab({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <Button
      color="inherit"
      disableRipple
      sx={{
        fontWeight: 700,
        textTransform: "none",
        borderRadius: 0,
        px: 1.5,
        py: 0.75,
        borderBottom: 2,
        borderColor: active ? "primary.main" : "transparent",
        color: active ? "primary.main" : "text.secondary",
        cursor: "default",
        "&:hover": { bgcolor: "transparent" },
      }}
    >
      {label}
    </Button>
  );
}

export function PortalPreviewChrome({ activePage }: PortalPreviewChromeProps) {
  const isCatalog = activePage === "catalog" || activePage === "equipment";
  const isNews = activePage === "news";

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          width: "100%",
          mx: "auto",
          gap: 1,
          flexWrap: "nowrap",
          py: 1.5,
          minHeight: 64,
          alignItems: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: "-0.02em",
            mr: 1,
            flexShrink: 0,
            color: "text.primary",
          }}
        >
          GearHub
        </Typography>

        <Box sx={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>
          <PreviewNavTab label="Catalog" active={isCatalog} />
          <PreviewNavTab label="News" active={isNews} />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            mx: 2,
            display: { xs: "none", sm: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isCatalog ? (
            <TextField
              placeholder="Search catalog…"
              size="small"
              fullWidth
              disabled
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} aria-hidden />
                    </InputAdornment>
                  ),
                },
              }}
            />
          ) : (
            <Box sx={{ width: "100%", height: 40 }} aria-hidden />
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Sign in
          </Button>
          <Badge badgeContent={0} color="primary" invisible>
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled
              startIcon={<ShoppingCart size={18} aria-hidden />}
              sx={{ fontWeight: 600 }}
            >
              Cart
            </Button>
          </Badge>
        </Box>
      </Toolbar>
    </Box>
  );
}
