import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCustomer } from "../../api/generated/react-query";

export function useCustomersAdmin() {
  const list = useGetApiCustomer({ client: gearhubApiClientOptions });
  return { list };
}
