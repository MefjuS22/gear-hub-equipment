import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/intranet")({
  component: IntranetLayout,
});

function IntranetLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "#212529",
          color: "#fff",
          padding: "1rem 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 1rem 1rem", fontWeight: 700, borderBottom: "1px solid #495057" }}>
          GearHub Intranet
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "1rem" }}>
          <NavItem to="/intranet">Dashboard</NavItem>
          <NavItem to="/intranet/orders">Zamówienia</NavItem>
          <NavItem to="/intranet/equipment">Sprzęt</NavItem>
          <NavItem to="/intranet/categories">Kategorie</NavItem>
          <NavItem to="/intranet/brands">Marki</NavItem>
          <NavItem to="/intranet/warehouses">Magazyny</NavItem>
          <NavItem to="/intranet/customers">Klienci</NavItem>
          <NavItem to="/intranet/users">Użytkownicy</NavItem>
          <NavItem to="/intranet/maintenance">Serwisy</NavItem>
          <NavItem to="/intranet/portal-texts">Treści portalu</NavItem>
        </nav>
      </aside>
      <div style={{ flex: 1, background: "#f1f3f5" }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #dee2e6", padding: "1rem 1.5rem" }}>
          <Link to="/" style={{ color: "#495057" }}>
            ← Strona główna
          </Link>
        </header>
        <main style={{ padding: "1.5rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{ color: "#adb5bd", textDecoration: "none", padding: "0.5rem 1rem", display: "block" }}
    >
      {children}
    </Link>
  );
}
