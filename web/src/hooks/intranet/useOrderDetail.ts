import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiOrderId } from "../../api/generated/react-query";

export function useOrderDetail(orderId: number) {
  return useGetApiOrderId(orderId, {
    client: gearhubApiClientOptions,
    query: {
      enabled: Number.isFinite(orderId) && orderId > 0,
    },
  });
}
