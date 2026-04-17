import { useEquipmentAdmin } from "../../hooks/intranet/useEquipmentAdmin";

export function EquipmentAdminView() {
  const { equipment, categories, brands, warehouses, remove, form, handleSubmitForm, create } =
    useEquipmentAdmin();

  if (equipment.isLoading) return <p>Ładowanie…</p>;

  return (
    <div>
      <h1 className="h4 mb-3">Sprzęt</h1>
      <form onSubmit={handleSubmitForm} className="card mb-3">
        <div className="card-body row g-2">
          <div className="col-md-4">
            <input
              {...form.register("name")}
              className={`form-control ${form.formState.errors.name ? "is-invalid" : ""}`}
              placeholder="Nazwa"
            />
            {form.formState.errors.name && (
              <div className="invalid-feedback d-block">{form.formState.errors.name.message}</div>
            )}
          </div>
          <div className="col-md-2">
            <select {...form.register("categoryId", { valueAsNumber: true })} className="form-select">
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select {...form.register("brandId", { valueAsNumber: true })} className="form-select">
              {brands.data?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <select {...form.register("warehouseId", { valueAsNumber: true })} className="form-select">
              {warehouses.length > 0 ? (
                warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))
              ) : (
                <option value={1}>Magazyn #1 (dodaj najpierw sprzęt w bazie)</option>
              )}
            </select>
          </div>
          <div className="col-md-1">
            <input
              type="number"
              step="0.01"
              {...form.register("dailyRate", { valueAsNumber: true })}
              className={`form-control ${form.formState.errors.dailyRate ? "is-invalid" : ""}`}
            />
          </div>
          <div className="col-md-1 form-check mt-2">
            <input type="checkbox" className="form-check-input" id="avail" {...form.register("isAvailable")} />
            <label className="form-check-label" htmlFor="avail">
              Dost.
            </label>
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary" disabled={create.isPending}>
              Dodaj sprzęt
            </button>
          </div>
        </div>
      </form>
      <div className="table-responsive">
        <table className="table table-sm bg-white">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nazwa</th>
              <th>Stawka</th>
              <th>Dostępny</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {equipment.data?.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>{e.dailyRate}</td>
                <td>{e.isAvailable ? "tak" : "nie"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => e.id != null && remove.mutate({ id: e.id })}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
