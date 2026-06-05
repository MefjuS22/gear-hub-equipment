import { useEffect, useState } from "react";

import { useAuthSessionStore } from "../store/authSessionStore";

export function useAuthHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => useAuthSessionStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthSessionStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useAuthSessionStore.persist.hasHydrated());
    return unsub;
  }, []);

  return hydrated;
}
