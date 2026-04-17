import { useWarehousesAdmin } from "../../hooks/intranet/useWarehousesAdmin";

export function WarehousesAdminView() {
  const { list } = useWarehousesAdmin();

  if (list.isLoading) return <p>Ładowanie…</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Magazyny</h1>
      <p className="text-muted small">
        Brak endpointu magazynów w OpenAPI — poniżej unikalne magazyny wyprowadzone z przypisań sprzętu (nazwa +
        ID). Lokalizacja nie jest dostępna w DTO sprzętu.
      </p>
      <table className="table table-sm bg-white">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Lokalizacja</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((w) => (
            <tr key={w.id}>
              <td>{w.id}</td>
              <td>{w.name}</td>
              <td>{w.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
