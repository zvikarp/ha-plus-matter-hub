import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "var(--primary-color, #03a9f4)",
    },
    secondary: {
      main: "var(--accent-color, #ff9800)",
    },
    error: {
      main: "var(--error-color, #db4437)",
    },
    warning: {
      main: "var(--warning-color, #ffa000)",
    },
    success: {
      main: "var(--success-color, #43a047)",
    },
    info: {
      main: "var(--info-color, #039be5)",
    },
    background: {
      default: "var(--primary-background-color, #fafafa)",
      paper: "var(--card-background-color, #ffffff)",
    },
    text: {
      primary: "var(--primary-text-color, #212121)",
      secondary: "var(--secondary-text-color, #727272)",
    },
    divider: "var(--divider-color, rgba(0, 0, 0, 0.12))",
  },
  typography: {
    fontFamily:
      "var(--primary-font-family, Roboto, Helvetica, Arial, sans-serif)",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--primary-background-color, #fafafa)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor:
            "var(--app-header-background-color, var(--primary-color, #03a9f4))",
          color:
            "var(--app-header-text-color, var(--text-light-primary-color, #ffffff))",
        },
      },
    },
  },
});
