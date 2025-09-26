import { useEffect, useState } from "react";

export function useHydrated() {
  const [hydrated, setHydrated] = useState<boolean>(false);

  // useEffect only execute in client side
  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
