import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import type { FC } from "react";
import { Outlet } from "react-router";
import { AppTopBar } from "./AppTopBar.tsx";

export const AppLayout: FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  return (
    <Box className="ha-plus-collection-host">
      {!embedded && (
        <>
          <AppTopBar />
          <Toolbar />
        </>
      )}
      <Outlet context={{ embedded }} />
    </Box>
  );
};
