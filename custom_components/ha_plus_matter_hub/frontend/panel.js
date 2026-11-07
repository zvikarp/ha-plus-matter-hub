var iframePanelStyles=`
  :host {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-rows: var(--header-height, 56px) minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

  header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    font: 500 20px var(--primary-font-family, Roboto, sans-serif);
    background: var(--app-header-background-color);
    color: var(--app-header-text-color);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    color: inherit;
    text-decoration: none;
  }

  header img {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  header span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .version {
    font-size: 12px;
    font-weight: 400;
    opacity: .7;
    margin-right: 16px;
  }

  iframe {
    display: block;
    border: 0;
    width: 100%;
    height: 100%;
    min-height: 0;
  }

  @media (max-width: 400px) {
    header {
      gap: 8px;
      font-size: 18px;
    }
  }
`;var path="M402.016,25.999 C448.377,25.999 486.016,63.638 486.016,110 L486.016,401.999 C486.016,448.36 448.377,485.999 402.016,485.999 L110.016,485.999 C63.655,485.999 26.016,448.36 26.016,401.999 L26.016,110 C26.016,63.638 63.655,25.999 110.016,25.999 Z M161.928,336.958 C184.703,363.395 218.418,380.145 256.016,380.145 C292.551,380.145 325.422,364.328 348.147,339.174 L372.229,352.369 C383.602,358.601 397.87,354.606 404.354,343.375 C410.839,332.144 407.164,317.79 396.08,311.056 L373.171,297.138 C377.698,284.261 380.161,270.415 380.161,255.999 C380.161,194.814 335.803,143.908 277.519,133.713 L276.867,104.573 C276.578,91.608 265.984,81.248 253.016,81.248 C240.047,81.248 229.453,91.608 229.164,104.573 L228.486,134.923 C173.198,147.46 131.87,196.942 131.87,255.999 C131.87,269.293 133.964,282.101 137.84,294.112 L109.951,311.056 C98.867,317.79 95.193,332.144 101.677,343.375 C108.161,354.606 122.429,358.601 133.803,352.369 Z M256.016,186 C256.016,205.496 258.476,218.495 275.998,236.017 C293.506,253.526 306.549,256 326.016,256 C306.519,256 293.52,258.46 275.998,275.982 C258.489,293.49 256.016,306.532 256.016,326 C256.016,306.503 253.556,293.504 236.034,275.982 C218.525,258.474 205.483,256 186.016,256 C205.513,256 218.511,253.539 236.034,236.017 C253.543,218.509 256.016,205.467 256.016,186 Z M270.114,186 Q270.114,200.077 272.835,207.716 Q276.146,217.015 286.377,227.245 Q296.442,237.31 305.365,240.488 Q312.527,243.038 326.016,243.038 Q331.855,243.038 335.985,246.834 Q340.114,250.631 340.114,256 Q340.114,261.368 335.985,265.165 Q331.855,268.961 326.016,268.961 Q312.506,268.961 305.359,271.506 Q296.453,274.678 286.377,284.754 Q276.156,294.974 272.84,304.289 Q270.114,311.942 270.114,326 Q270.114,331.368 265.985,335.165 Q261.855,338.961 256.016,338.961 Q250.176,338.961 246.047,335.165 Q241.918,331.368 241.918,326 Q241.918,311.922 239.197,304.283 Q235.886,294.985 225.655,284.754 Q215.59,274.689 206.667,271.511 Q199.505,268.961 186.016,268.961 Q180.176,268.961 176.047,265.165 Q171.918,261.368 171.918,256 Q171.918,250.631 176.047,246.834 Q180.176,243.038 186.016,243.038 Q186.022,243.038 186.134,243.038 Q199.557,243.027 206.673,240.493 Q215.579,237.321 225.655,227.245 Q235.875,217.025 239.192,207.71 Q241.918,200.057 241.918,186 Q241.918,180.631 246.047,176.834 Q250.176,173.038 256.016,173.038 Q261.855,173.038 265.985,176.834 Q270.114,180.631 270.114,186 Z M256.015,233.821 Q251.875,239.327 246.412,244.79 Q239.878,251.324 233.241,256.001 Q239.881,260.679 246.412,267.21 Q251.877,272.675 256.017,278.178 Q260.157,272.672 265.62,267.21 Q272.154,260.676 278.791,255.998 Q272.151,251.321 265.62,244.79 Q260.155,239.325 256.015,233.821 Z";window.customIcons=window.customIcons||{};window.customIcons["matter-hub-plus"]={getIcon:async name=>name==="logo"?{path,viewBox:"0 0 513 512"}:void 0};var MatterHubPanel=class extends HTMLElement{set hass(value){this._hass=value;if(this.menu)this.menu.hass=value}set narrow(value){this._narrow=value;if(this.menu)this.menu.narrow=value}connectedCallback(){if(!this.shadowRoot){const root=this.attachShadow({mode:"open"});root.innerHTML=`
        <style>${iframePanelStyles}</style>
        <header>
          <ha-menu-button></ha-menu-button>
          <a class="brand" href="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1" target="ha-plus-matter-hub-ui">
            <img src="/ha_plus_matter_hub/logo.png" alt="" />
            <span>HA+ Matter Hub</span>
          </a>
          <span class="version"></span>
        </header>
        <iframe name="ha-plus-matter-hub-ui" title="HA+ Matter Hub" src="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1"></iframe>`;root.querySelector(".version").textContent=new URL(import.meta.url).searchParams.get("v")||"";this.menu=root.querySelector("ha-menu-button");this.menu.hass=this._hass;this.menu.narrow=this._narrow;this.frame=root.querySelector("iframe")}this.listener=event=>this.handleRequest(event);window.addEventListener("message",this.listener)}disconnectedCallback(){window.removeEventListener("message",this.listener)}async handleRequest(event){if(event.origin!==location.origin||event.source!==this.frame.contentWindow||event.data?.type!=="ha-plus-matter-hub-request"||event.ports.length!==1)return;const port=event.ports[0];try{const{method,path:path2,body}=event.data;const result=await this._hass.callWS({type:"ha_plus_matter_hub/request",method,path:path2,...body==null?{}:{body}});port.postMessage(result)}catch(error){port.postMessage({status:503,body:JSON.stringify({error:error.message||"The Matter engine is unavailable"})})}finally{port.close()}}};if(!customElements.get("ha-plus-matter-hub-panel"))customElements.define("ha-plus-matter-hub-panel",MatterHubPanel);
/*! Bundled license information:

@ha-plus/ui/src/iframe-panel.js:
  (*! Adapted from HA+ Matter Hub. Licensed under Apache-2.0. See ha-plus-ui.NOTICE and ha-plus-ui.LICENSE-APACHE-2.0 in the distribution. *)

@ha-plus/ui/src/index.js:
  (*! @ha-plus/ui v0.3.0 | MIT | Copyright (c) 2026 HA+ contributors | https://github.com/zvikarp/ha-plus-packages/blob/main/LICENSE *)
*/
