import { gearhubApiClientOptions } from "../../api/clientOptions";
import { useGetApiCategory } from "../../api/generated/react-query";

export function useCategoriesAdmin() {
  const list = useGetApiCategory({ client: gearhubApiClientOptions });
  return { list };
}
