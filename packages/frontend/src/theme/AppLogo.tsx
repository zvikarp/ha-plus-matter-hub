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
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: props.large ? "flex-start" : "center",
        flexGrow: 1,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <Box
        component="img"
        src={logo}
        alt=""
        sx={{
          height: "40px",
          width: "40px",
          flexShrink: 0,
          objectFit: "contain",
        }}
      />
      <Typography variant="inherit" component="span" sx={{ mr: 1, ml: 1 }}>
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
