import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#03a9f4",
    },
    secondary: {
      main: "#ff9800",
    },
    error: {
      main: "#db4437",
    },
    warning: {
      main: "#ffa000",
    },
    success: {
      main: "#43a047",
    },
    info: {
      main: "#039be5",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#727272",
    },
    divider: "rgba(0, 0, 0, 0.12)",
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
          color: "var(--primary-text-color, #212121)",
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--card-background-color, #ffffff)",
          color: "var(--primary-text-color, #212121)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "var(--divider-color, rgba(0, 0, 0, 0.12))",
        },
      },
    },
  },
});
