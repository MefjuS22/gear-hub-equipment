import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiEquipment } from "../../api/generated/react-query";

/** Statyczny blok hero — brak endpointu treści portalu w obecnym OpenAPI. */
export const PORTAL_HERO = {
  title: "Wypożyczalnia sprzętu",
  body: "Przeglądaj dostępny sprzęt i składaj zamówienia wynajmu.",
} as const;

export function usePortalCatalog() {
  const equipment = useGetApiEquipment({
    client: gearhubApiClientOptions,
  });

  return { equipment };
}
