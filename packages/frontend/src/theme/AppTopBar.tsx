import { muiStyles } from "@ha-plus/ui/mui";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AppLogo } from "./AppLogo.tsx";

export const AppTopBar = () => {
  const isLargeScreen = useMediaQuery("(min-width:600px)");

  return (
    <AppBar sx={muiStyles.topBar}>
      <Toolbar sx={muiStyles.toolbar}>
        <Container sx={muiStyles.headerContent}>
          <AppLogo large={isLargeScreen} />
        </Container>
      </Toolbar>
    </AppBar>
  );
};
