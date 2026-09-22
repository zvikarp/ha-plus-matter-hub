import { createTheme } from "@mui/material/styles";
import { defaultHaTheme, type HaTheme } from "./ha-theme.ts";

export const createAppTheme = (haTheme: HaTheme) =>
  createTheme({
    palette: {
      mode: haTheme.mode,
      primary: {
        main: haTheme.primary,
      },
      secondary: {
        main: haTheme.secondary,
      },
      error: {
        main: haTheme.error,
      },
      warning: {
        main: haTheme.warning,
      },
      success: {
        main: haTheme.success,
      },
      info: {
        main: haTheme.info,
      },
      background: {
        default: haTheme.backgroundDefault,
        paper: haTheme.backgroundPaper,
      },
      text: {
        primary: haTheme.textPrimary,
        secondary: haTheme.textSecondary,
      },
      divider: haTheme.divider,
    },
    typography: {
      fontFamily:
        "var(--primary-font-family, Roboto, Helvetica, Arial, sans-serif)",
      h6: {
        fontSize: "1.25rem",
        fontWeight: 500,
      },
      button: {
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: haTheme.backgroundDefault,
            color: haTheme.textPrimary,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: haTheme.appHeaderBackground,
            color: haTheme.appHeaderText,
            borderRadius: 0,
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            minHeight: 36,
            padding: "6px 16px",
            borderRadius: 4,
            textTransform: "none",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            width: 40,
            height: 40,
            color: haTheme.textSecondary,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: haTheme.backgroundPaper,
            color: haTheme.textPrimary,
            borderRadius: "var(--ha-card-border-radius, 12px)",
            backgroundImage: "none",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderColor: `var(--ha-card-border-color, ${haTheme.divider})`,
            borderStyle: "solid",
            borderWidth: "var(--ha-card-border-width, 0px)",
            boxShadow:
              "var(--ha-card-box-shadow, 0 2px 2px rgba(0, 0, 0, 0.12))",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: haTheme.backgroundPaper,
          },
          notchedOutline: {
            borderColor: haTheme.divider,
          },
        },
      },
      MuiListSubheader: {
        styleOverrides: {
          root: {
            minHeight: 48,
            lineHeight: "48px",
            color: haTheme.textSecondary,
            backgroundColor: haTheme.backgroundPaper,
            fontWeight: 500,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            minHeight: 48,
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            color: haTheme.textPrimary,
            backgroundColor: haTheme.backgroundPaper,
            backgroundImage: "none",
            boxShadow: "none",
            "&:before": {
              backgroundColor: haTheme.divider,
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 48,
            "&.Mui-expanded": {
              minHeight: 48,
            },
          },
          content: {
            margin: "12px 0",
            "&.Mui-expanded": {
              margin: "12px 0",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: haTheme.textPrimary,
            borderColor: haTheme.divider,
          },
          head: {
            fontWeight: 500,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: "1.25rem",
            fontWeight: 500,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: haTheme.divider,
          },
        },
      },
    },
  });

export const appTheme = createAppTheme(defaultHaTheme);
