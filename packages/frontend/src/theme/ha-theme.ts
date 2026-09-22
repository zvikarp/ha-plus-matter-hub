const HA_THEME_VARS = [
  "--primary-color",
  "--accent-color",
  "--error-color",
  "--warning-color",
  "--success-color",
  "--info-color",
  "--divider-color",
  "--primary-text-color",
  "--secondary-text-color",
  "--text-primary-color",
  "--text-light-primary-color",
  "--primary-background-color",
  "--secondary-background-color",
  "--card-background-color",
  "--ha-card-background",
  "--ha-card-border-radius",
  "--ha-card-border-color",
  "--ha-card-border-width",
  "--ha-card-box-shadow",
  "--app-header-background-color",
  "--app-header-text-color",
  "--state-icon-color",
  "--state-icon-active-color",
  "--mdc-theme-primary",
  "--mdc-theme-secondary",
  "--mdc-theme-error",
  "--mdc-theme-surface",
  "--mdc-theme-on-surface",
  "--mdc-theme-on-primary",
  "--mdc-theme-on-secondary",
  "--mdc-theme-background",
  "--primary-font-family",
  "--secondary-font-family",
];

export interface HaTheme {
  mode: "light" | "dark";
  primary: string;
  secondary: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  divider: string;
  textPrimary: string;
  textSecondary: string;
  backgroundDefault: string;
  backgroundPaper: string;
  appHeaderBackground: string;
  appHeaderText: string;
}

export const defaultHaTheme: HaTheme = {
  mode: "light",
  primary: "rgb(3, 169, 244)",
  secondary: "rgb(255, 152, 0)",
  error: "rgb(219, 68, 55)",
  warning: "rgb(255, 160, 0)",
  success: "rgb(67, 160, 71)",
  info: "rgb(3, 155, 229)",
  divider: "rgba(0, 0, 0, 0.12)",
  textPrimary: "rgb(33, 33, 33)",
  textSecondary: "rgb(114, 114, 114)",
  backgroundDefault: "rgb(250, 250, 250)",
  backgroundPaper: "rgb(255, 255, 255)",
  appHeaderBackground: "rgb(3, 169, 244)",
  appHeaderText: "rgb(255, 255, 255)",
};

function getParentDocument(): Document | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (window.parent?.document) {
      return window.parent.document;
    }
  } catch {
    return null;
  }

  return null;
}

function copyHaThemeVars(): void {
  const parentDocument = getParentDocument();
  if (!parentDocument) {
    return;
  }

  const parentRoot = parentDocument.documentElement;
  const localRoot = document.documentElement;
  const parentStyles = parentDocument.defaultView?.getComputedStyle(parentRoot);

  if (!parentStyles) {
    return;
  }

  for (const variable of HA_THEME_VARS) {
    const value = parentStyles.getPropertyValue(variable)?.trim();
    if (value) {
      localRoot.style.setProperty(variable, value);
    } else if (parentDocument !== document) {
      localRoot.style.removeProperty(variable);
    }
  }
}

function resolveCssColor(variable: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }

  const probe = document.createElement("span");
  probe.style.color = `var(${variable}, ${fallback})`;
  probe.style.display = "none";
  document.documentElement.appendChild(probe);
  const color = window.getComputedStyle(probe).color || fallback;
  probe.remove();
  return color;
}

function colorLuminance(color: string): number {
  const channels = color.match(
    /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i,
  );
  if (!channels) {
    return 0;
  }

  const linearChannels = channels.slice(1, 4).map((channel) => {
    const value = Number(channel) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return (
    0.2126 * linearChannels[0] +
    0.7152 * linearChannels[1] +
    0.0722 * linearChannels[2]
  );
}

export function readHaTheme(): HaTheme {
  copyHaThemeVars();

  const textPrimary = resolveCssColor(
    "--primary-text-color",
    defaultHaTheme.textPrimary,
  );
  const backgroundDefault = resolveCssColor(
    "--primary-background-color",
    defaultHaTheme.backgroundDefault,
  );
  const cardBackground = resolveCssColor(
    "--card-background-color",
    defaultHaTheme.backgroundPaper,
  );

  return {
    mode:
      colorLuminance(textPrimary) > colorLuminance(backgroundDefault)
        ? "dark"
        : "light",
    primary: resolveCssColor("--primary-color", defaultHaTheme.primary),
    secondary: resolveCssColor("--accent-color", defaultHaTheme.secondary),
    error: resolveCssColor("--error-color", defaultHaTheme.error),
    warning: resolveCssColor("--warning-color", defaultHaTheme.warning),
    success: resolveCssColor("--success-color", defaultHaTheme.success),
    info: resolveCssColor("--info-color", defaultHaTheme.info),
    divider: resolveCssColor("--divider-color", defaultHaTheme.divider),
    textPrimary,
    textSecondary: resolveCssColor(
      "--secondary-text-color",
      defaultHaTheme.textSecondary,
    ),
    backgroundDefault,
    backgroundPaper: resolveCssColor("--ha-card-background", cardBackground),
    appHeaderBackground: resolveCssColor(
      "--app-header-background-color",
      resolveCssColor("--primary-color", defaultHaTheme.appHeaderBackground),
    ),
    appHeaderText: resolveCssColor(
      "--app-header-text-color",
      resolveCssColor(
        "--text-light-primary-color",
        defaultHaTheme.appHeaderText,
      ),
    ),
  };
}

export function startHaThemeSync(
  onChange: (theme: HaTheme) => void,
): () => void {
  let previousTheme = "";
  const sync = () => {
    const theme = readHaTheme();
    const serializedTheme = JSON.stringify(theme);
    if (serializedTheme !== previousTheme) {
      previousTheme = serializedTheme;
      document.documentElement.style.colorScheme = theme.mode;
      onChange(theme);
    }
  };

  sync();

  const parentDocument = getParentDocument();
  if (!parentDocument) {
    return () => undefined;
  }

  // Theme variables live in Home Assistant's parent frame. Polling avoids
  // cross-realm MutationObserver incompatibilities while still following
  // theme changes made after this page has loaded.
  const interval = window.setInterval(sync, 5000);
  return () => {
    window.clearInterval(interval);
  };
}
