import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiBrand } from "../../api/generated/react-query";

export function useBrandsAdmin() {
  const list = useGetApiBrand({ client: gearhubApiClientOptions });
  return { list };
}
