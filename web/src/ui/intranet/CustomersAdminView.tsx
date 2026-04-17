import { useCustomersAdmin } from "../../hooks/intranet/useCustomersAdmin";

export function CustomersAdminView() {
  const { list } = useCustomersAdmin();

  if (list.isLoading) return <p>Ładowanie…</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Klienci</h1>
      <p className="text-muted small">
        API udostępnia wyłącznie listę klientów (GET) — dodawanie i usuwanie wymaga rozszerzenia backendu.
      </p>
      <table className="table table-sm bg-white">
        <thead>
          <tr>
            <th>ID</th>
            <th>Firma</th>
            <th>Kontakt</th>
          </tr>
        </thead>
        <tbody>
          {list.data?.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.companyName}</td>
              <td>{c.contactPerson}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
