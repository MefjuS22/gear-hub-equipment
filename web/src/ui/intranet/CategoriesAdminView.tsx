import { useCategoriesAdmin } from "../../hooks/intranet/useCategoriesAdmin";

export function CategoriesAdminView() {
  const { list } = useCategoriesAdmin();

  if (list.isLoading) return <p>Ładowanie…</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Kategorie</h1>
      <p className="text-muted small">
        API udostępnia wyłącznie listę kategorii (GET) — dodawanie i usuwanie wymaga rozszerzenia backendu.
      </p>
      <table className="table table-sm bg-white">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Opis</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
