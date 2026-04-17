export function MaintenanceAdminView() {
  return (
    <div>
      <h1 className="h4 mb-3">Serwisy / konserwacja</h1>
      <p className="text-muted">
        Brak endpointów konserwacji w obecnym OpenAPI. Po dodaniu ich w backendzie uruchom ponownie{" "}
        <code>npm run api:generate</code>.
      </p>
    </div>
  );
}
