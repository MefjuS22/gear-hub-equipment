import { QueryClient } from "@tanstack/react-query";

export const gearhubQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});
