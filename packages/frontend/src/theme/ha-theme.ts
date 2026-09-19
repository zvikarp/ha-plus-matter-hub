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
    }
  }
}

export function startHaThemeSync(): void {
  copyHaThemeVars();

  const parentDocument = getParentDocument();
  if (!parentDocument) {
    return;
  }

  const parentRoot = parentDocument.documentElement;
  const observer = new MutationObserver(() => copyHaThemeVars());
  observer.observe(parentRoot, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  // Fallback: re-sync periodically in case theme updates bypass DOM mutations.
  const interval = window.setInterval(copyHaThemeVars, 5000);
  window.addEventListener(
    "beforeunload",
    () => {
      observer.disconnect();
      window.clearInterval(interval);
    },
    { once: true },
  );
}
