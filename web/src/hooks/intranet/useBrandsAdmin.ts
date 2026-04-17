import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiBrand } from "../../api/generated/react-query";

/** Tylko odczyt — backend nie udostępnia mutacji dla marek w OpenAPI. */
export function useBrandsAdmin() {
  const list = useGetApiBrand({ client: gearhubApiClientOptions });
  return { list };
}
