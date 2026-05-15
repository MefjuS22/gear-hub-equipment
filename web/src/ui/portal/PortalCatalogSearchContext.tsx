import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PortalCatalogSearchContextValue = {
  search: string;
  setSearch: (value: string) => void;
};

const PortalCatalogSearchContext =
  createContext<PortalCatalogSearchContextValue | null>(null);

export function PortalCatalogSearchProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [search, setSearchState] = useState("");
  const setSearch = useCallback((value: string) => {
    setSearchState(value);
  }, []);

  const value = useMemo(() => ({ search, setSearch }), [search, setSearch]);

  return (
    <PortalCatalogSearchContext.Provider value={value}>
      {children}
    </PortalCatalogSearchContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePortalCatalogSearch() {
  const ctx = useContext(PortalCatalogSearchContext);
  if (!ctx) {
    throw new Error(
      "usePortalCatalogSearch must be used within PortalCatalogSearchProvider",
    );
  }
  return ctx;
}
