import { PORTAL_HERO, usePortalCatalog } from "../../hooks/portal/usePortalCatalog";
import { useCart } from "./cartContext";

export function PortalCatalogView() {
  const { equipment } = usePortalCatalog();
  const { add } = useCart();

  if (equipment.isLoading) return <p>Ładowanie katalogu…</p>;
  if (equipment.error) return <p className="text-danger">Błąd ładowania.</p>;

  return (
    <div>
      <div className="p-4 mb-4 rounded bg-white shadow-sm border">
        <h1 className="h3">{PORTAL_HERO.title}</h1>
        <p className="mb-0 text-muted">{PORTAL_HERO.body}</p>
      </div>
      <h2 className="h4 mb-3">Katalog sprzętu</h2>
      <div className="row g-3">
        {equipment.data?.map((item) => (
          <div key={item.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h2 className="h5 card-title">{item.name}</h2>
                <p className="card-text small text-muted mb-1">
                  {item.categoryName} · {item.brandName}
                </p>
                <p className="mb-2">
                  <strong>{(item.dailyRate ?? 0).toFixed(2)}</strong> PLN / dzień
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!item.isAvailable}
                  onClick={() =>
                    add({
                      equipmentId: item.id ?? 0,
                      name: item.name ?? "",
                      dailyRate: item.dailyRate ?? 0,
                    })
                  }
                >
                  {item.isAvailable ? "Dodaj do koszyka" : "Niedostępny"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
