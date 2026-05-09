import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiOrder } from "../../api/generated/react-query";

export function useOrdersList() {
  const list = useGetApiOrder({ client: gearhubApiClientOptions });
  return { list };
}
