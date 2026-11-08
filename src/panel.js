import { applyPreferences, iframePanelStyles, panelHeader } from "@ha-plus/ui";
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
  set panel(value) {
    this._panel = value;
    this.updateFrame();
  }
  updateFrame() {
    if (!this.frame) return;
    const version = encodeURIComponent(this._panel?.config?.version || "");
    const src = `/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1&v=${version}`;
    if (this.frame.getAttribute("src") !== src) this.frame.src = src;
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
        <iframe name="ha-plus-matter-hub-ui" title="HA+ Matter Hub" src="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1"></iframe>`;
      this.frame = root.querySelector("iframe");
      this.updateFrame();
      this.updateSettings();
    }
    this.listener = (event) => this.handleRequest(event);
    window.addEventListener("message", this.listener);
  }
  updateSettings() {
    if (!this.shadowRoot) return;
    const existing = this.shadowRoot.querySelector("header");
    if (existing && existing._admin === Boolean(this._hass?.user?.is_admin)) {
      const menu = existing.querySelector("ha-menu-button");
      menu.hass = this._hass;
      menu.narrow = this._narrow;
      return;
    }
    const header = panelHeader("HA+ Matter Hub", {
      hass: this._hass,
      narrow: this._narrow,
      domain: "ha_plus_matter_hub",
      iconUrl: "/ha_plus_matter_hub/logo.png",
      onRefresh: () => this.frame.contentWindow.location.reload(),
    });
    header._admin = Boolean(this._hass?.user?.is_admin);
    const previous = this.shadowRoot.querySelector("header");
    if (previous) previous.replaceWith(header);
    else this.shadowRoot.insertBefore(header, this.frame);
    this.menu = header.querySelector("ha-menu-button");
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
