import { useBrandsAdmin } from "../../hooks/intranet/useBrandsAdmin";

export function BrandsAdminView() {
  const { list } = useBrandsAdmin();

  if (list.isLoading) return <p>Ładowanie…</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Marki</h1>
      <p className="text-muted small">
        API udostępnia wyłącznie listę marek (GET) — dodawanie i usuwanie wymaga rozszerzenia backendu.
      </p>
      <table className="table table-sm bg-white">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
