import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiEquipment } from "../../api/generated/react-query";

export const PORTAL_HERO = {
  title: "Equipment catalog",
  body: "Browse and reserve specialized rental equipment. Filter by category or search by name, brand, or model.",
} as const;

export function usePortalCatalog() {
  const equipment = useGetApiEquipment({
    client: gearhubApiClientOptions,
  });

  return { equipment };
}
