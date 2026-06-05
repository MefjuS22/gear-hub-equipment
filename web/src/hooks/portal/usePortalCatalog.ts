import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiEquipment } from "../../api/generated/react-query";

export function usePortalCatalog() {
  const equipment = useGetApiEquipment({
    client: gearhubApiClientOptions,
  });

  return { equipment };
}
