import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div
        style={{
          padding: "0.5rem 1rem",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          background: "#f8f9fa",
        }}
      >
        <strong>GearHub</strong>
        <Link to="/">Start</Link>
        <Link to="/portal">Portal</Link>
        <Link to="/intranet">Intranet</Link>
      </div>
      <Outlet />
    </>
  ),
});
