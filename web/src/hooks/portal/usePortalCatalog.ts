import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiEquipment } from "../../api/generated/react-query";

export const PORTAL_HERO = {
  title: "Equipment rental",
  body: "Browse available gear and place rental orders.",
} as const;

export function usePortalCatalog() {
  const equipment = useGetApiEquipment({
    client: gearhubApiClientOptions,
  });

  return { equipment };
}
