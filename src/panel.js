import {
  applyPreferences,
  iconButton,
  iframePanelStyles,
  integrationUrl,
  localize,
  navigate,
} from "@ha-plus/ui";
import { path } from "../custom_components/ha_plus_matter_hub/frontend/icon.js";

window.customIcons = window.customIcons || {};
window.customIcons["matter-hub-plus"] = {
  getIcon: async (name) =>
    name === "logo" ? { path, viewBox: "0 0 513 512" } : undefined,
};

class MatterHubPanel extends HTMLElement {
  set hass(value) {
    this._hass = value;
    applyPreferences(this, value);
    this.updateSettings();
    if (this.menu) this.menu.hass = value;
  }
  set narrow(value) {
    this._narrow = value;
    if (this.menu) this.menu.narrow = value;
  }
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>${iframePanelStyles}</style>
        <header>
          <ha-menu-button></ha-menu-button>
          <a class="brand" href="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1" target="ha-plus-matter-hub-ui">
            <img src="/ha_plus_matter_hub/logo.png" alt="" />
            <span>HA+ Matter Hub</span>
          </a>
          <span class="version"></span>
        </header>
        <iframe name="ha-plus-matter-hub-ui" title="HA+ Matter Hub" src="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1"></iframe>`;
      root.querySelector(".version").textContent =
        new URL(import.meta.url).searchParams.get("v") || "";
      this.menu = root.querySelector("ha-menu-button");
      this.menu.hass = this._hass;
      this.menu.narrow = this._narrow;
      this.frame = root.querySelector("iframe");
      this.updateSettings();
    }
    this.listener = (event) => this.handleRequest(event);
    window.addEventListener("message", this.listener);
  }
  updateSettings() {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelector("[data-settings]")?.remove();
    if (!this._hass?.user?.is_admin) return;
    const settings = iconButton(
      localize(this._hass, {}, "settings"),
      "mdi:cog",
      () => {
        if (this._hass?.user?.is_admin)
          navigate(this, integrationUrl("ha_plus_matter_hub"));
      },
    );
    settings.dataset.settings = "";
    this.shadowRoot.querySelector("header").append(settings);
  }
  disconnectedCallback() {
    window.removeEventListener("message", this.listener);
  }
  async handleRequest(event) {
    if (
      event.origin !== location.origin ||
      event.source !== this.frame.contentWindow ||
      event.data?.type !== "ha-plus-matter-hub-request" ||
      event.ports.length !== 1
    )
      return;
    const port = event.ports[0];
    try {
      const { method, path, body } = event.data;
      const result = await this._hass.callWS({
        type: "ha_plus_matter_hub/request",
        method,
        path,
        ...(body == null ? {} : { body }),
      });
      port.postMessage(result);
    } catch (error) {
      port.postMessage({
        status: 503,
        body: JSON.stringify({
          error: error.message || "The Matter engine is unavailable",
        }),
      });
    } finally {
      port.close();
    }
  }
}
if (!customElements.get("ha-plus-matter-hub-panel"))
  customElements.define("ha-plus-matter-hub-panel", MatterHubPanel);
