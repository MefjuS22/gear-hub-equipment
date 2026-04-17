import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCategory } from "../../api/generated/react-query";

/** Tylko odczyt — backend nie udostępnia mutacji dla kategorii w OpenAPI. */
export function useCategoriesAdmin() {
  const list = useGetApiCategory({ client: gearhubApiClientOptions });
  return { list };
}
