import { brandLinkStyles, muiStyles } from "@ha-plus/ui/mui";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link } from "react-router";
import logo from "../assets/hamh-logo.png";
import { useAppInfo } from "../hooks/app-info.ts";
import { navigation } from "../routes.tsx";

export const AppLogo = (props: { large: boolean }) => {
  const appInfo = useAppInfo();

  return (
    <Box
      component={Link}
      to={navigation.bridges}
      sx={brandLinkStyles(props.large)}
    >
      <Box component="img" src={logo} alt="" sx={muiStyles.brandImage} />
      <Typography variant="inherit" component="span" sx={muiStyles.brandText}>
        {appInfo.name}
      </Typography>
      {props.large && (
        <Typography variant="caption" component="span">
          {appInfo.version}
        </Typography>
      )}
    </Box>
  );
};
