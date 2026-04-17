import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { CartProvider } from "../../ui/portal/cartContext";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  return (
    <CartProvider>
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <header
        style={{
          background: "#001f3f",
          color: "#fff",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/portal" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>
          GearHub Rentals
        </Link>
        <nav style={{ display: "flex", gap: "1.25rem" }}>
          <Link to="/portal" style={{ color: "#cfe8ff" }}>
            Katalog
          </Link>
          <Link to="/portal/cart" style={{ color: "#cfe8ff" }}>
            Koszyk
          </Link>
        </nav>
      </header>
      <main style={{ padding: "1.5rem", maxWidth: 1100, margin: "0 auto" }}>
        <Outlet />
      </main>
    </div>
    </CartProvider>
  );
}
