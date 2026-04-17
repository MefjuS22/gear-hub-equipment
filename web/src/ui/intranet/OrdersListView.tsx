import { Link } from "@tanstack/react-router";

export function OrdersListView() {
  return (
    <div>
      <h1 className="h4 mb-3">Zamówienia</h1>
      <p className="text-muted">
        Lista zamówień nie jest w obecnym kontrakcie OpenAPI (dostępne jest tylko{" "}
        <code>POST /api/Order/CreateOrder</code>). Składanie zamówienia możliwe jest w{" "}
        <Link to="/portal/cart" className="fw-semibold">
          portalu — koszyk
        </Link>
        .
      </p>
    </div>
  );
}
