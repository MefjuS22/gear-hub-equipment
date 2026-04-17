import { useMemo } from "react";
import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiEquipment } from "../../api/generated/react-query";
import { warehouseOptionsFromEquipment } from "../../lib/warehouseOptionsFromEquipment";

/** Lista magazynów wyprowadzona z przypisań sprzętu — brak GET /Warehouse w OpenAPI. */
export function useWarehousesAdmin() {
  const equipment = useGetApiEquipment({ client: gearhubApiClientOptions });
  const rows = useMemo(
    () =>
      warehouseOptionsFromEquipment(equipment.data).map((w) => ({
        id: w.id,
        name: w.name,
        location: "—" as const,
      })),
    [equipment.data],
  );

  return {
    list: {
      isLoading: equipment.isLoading,
      isError: equipment.isError,
      error: equipment.error,
      data: rows,
    },
  };
}
