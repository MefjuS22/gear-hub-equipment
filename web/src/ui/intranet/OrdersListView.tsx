import { Link } from "@tanstack/react-router";
import { Link as MuiLink, Typography } from "@mui/material";

export function OrdersListView() {
  return (
    <div>
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Orders
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Listing orders is not in the current OpenAPI contract (only{" "}
        <Typography component="code" variant="body2" sx={{ bgcolor: "action.hover", px: 0.5, borderRadius: 0.5 }}>
          POST /api/Order/CreateOrder
        </Typography>{" "}
        exists). Place orders from the{" "}
        <MuiLink component={Link} to="/portal/cart" sx={{ fontWeight: 600 }}>
          portal cart
        </MuiLink>
        .
      </Typography>
    </div>
  );
}
