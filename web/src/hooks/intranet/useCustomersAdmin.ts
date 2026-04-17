import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCustomer } from "../../api/generated/react-query";

/** Tylko odczyt — backend nie udostępnia mutacji dla klientów w OpenAPI. */
export function useCustomersAdmin() {
  const list = useGetApiCustomer({ client: gearhubApiClientOptions });
  return { list };
}
