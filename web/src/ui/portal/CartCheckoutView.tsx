import { useCartCheckout } from "../../hooks/portal/useCartCheckout";
import { PORTAL_CHECKOUT_STAFF_USER_ID } from "../../lib/portalConstants";

export function CartCheckoutView() {
  const { form, handleSubmitForm, lines, setQuantity, remove, customers, submit, subtotal } =
    useCartCheckout();

  return (
    <div>
      <h1 className="h3 mb-3">Koszyk i zamówienie</h1>
      {lines.length === 0 ? (
        <p>Koszyk jest pusty — dodaj sprzęt z katalogu.</p>
      ) : (
        <>
          <table className="table table-striped bg-white rounded shadow-sm">
            <thead>
              <tr>
                <th>Sprzęt</th>
                <th>Stawka / dzień</th>
                <th>Ilość</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.equipmentId}>
                  <td>{l.name}</td>
                  <td>{l.dailyRate.toFixed(2)} PLN</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      className="form-control form-control-sm"
                      style={{ width: 80 }}
                      value={l.quantity}
                      onChange={(e) => setQuantity(l.equipmentId, Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => remove(l.equipmentId)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form onSubmit={handleSubmitForm} className="card mb-3">
            <div className="card-body row g-3">
              <div className="col-md-6">
                <label className="form-label">Klient</label>
                <select
                  {...form.register("customerId", { valueAsNumber: true })}
                  className={`form-select ${form.formState.errors.customerId ? "is-invalid" : ""}`}
                  disabled={customers.isLoading}
                >
                  {customers.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <p className="small text-muted mb-0">
                  Zamówienie zostanie przypisane do użytkownika systemowego (ID {PORTAL_CHECKOUT_STAFF_USER_ID}) —
                  endpointów użytkowników nie ma w obecnym API.
                </p>
              </div>
              <div className="col-md-6">
                <label className="form-label">Start wynajmu</label>
                <input
                  type="date"
                  {...form.register("rentalStart")}
                  className={`form-control ${form.formState.errors.rentalStart ? "is-invalid" : ""}`}
                />
                {form.formState.errors.rentalStart && (
                  <div className="invalid-feedback d-block">{form.formState.errors.rentalStart.message}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Koniec wynajmu</label>
                <input
                  type="date"
                  {...form.register("rentalEnd")}
                  className={`form-control ${form.formState.errors.rentalEnd ? "is-invalid" : ""}`}
                />
                {form.formState.errors.rentalEnd && (
                  <div className="invalid-feedback d-block">{form.formState.errors.rentalEnd.message}</div>
                )}
              </div>
              <div className="col-12">
                <p className="mb-2">
                  Szacowany koszt (uproszczony): <strong>{subtotal.toFixed(2)} PLN</strong>
                </p>
                <button type="submit" className="btn btn-success" disabled={submit.isPending}>
                  Złóż zamówienie
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
