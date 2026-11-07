import { useMemo } from "react";

export interface AppInfo {
  name: string;
  version: string;
}

export function useAppInfo(): AppInfo {
  return useMemo(
    () => ({ name: "HA+ Matter Hub", version: __APP_VERSION__ }),
    [],
  );
}
