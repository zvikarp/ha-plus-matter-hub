import { muiStyles } from "@ha-plus/ui/mui";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import type { FC } from "react";
import { Outlet } from "react-router";
import { AppFooter } from "./AppFooter.tsx";
import { AppTopBar } from "./AppTopBar.tsx";

export const AppLayout: FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  return (
    <Box>
      {!embedded && (
        <>
          <AppTopBar />
          <Toolbar />
        </>
      )}
      <Container sx={muiStyles.padded}>
        <Outlet />
      </Container>
      <AppFooter />
    </Box>
  );
};
