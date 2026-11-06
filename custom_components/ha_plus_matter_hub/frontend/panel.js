import { path } from "./icon.js";

window.customIconsets = window.customIconsets || {};
window.customIconsets["matter-hub-plus"] = {
  getIcon: async () => ({ path, viewBox: "0 0 513 512" }),
};

class MatterHubPanel extends HTMLElement {
  set hass(value) {
    this._hass = value;
    if (this.menu) this.menu.hass = value;
  }
  set narrow(value) {
    this._narrow = value;
    if (this.menu) this.menu.narrow = value;
  }
  connectedCallback() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `<style>:host{display:flex;flex-direction:column;height:100%;}header{display:flex;align-items:center;flex-shrink:0;height:var(--header-height,56px);background:var(--app-header-background-color);color:var(--app-header-text-color);}iframe{border:0;width:100%;flex:1;min-height:0;}</style><header><ha-menu-button></ha-menu-button><span>HA+ Matter Hub</span></header><iframe title="HA+ Matter Hub" src="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1"></iframe>`;
      this.menu = root.querySelector("ha-menu-button");
      this.menu.hass = this._hass;
      this.menu.narrow = this._narrow;
      this.frame = root.querySelector("iframe");
    }
    this.listener = (event) => this.handleRequest(event);
    window.addEventListener("message", this.listener);
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
