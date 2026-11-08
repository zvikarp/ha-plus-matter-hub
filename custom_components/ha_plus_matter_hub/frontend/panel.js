function el(tag,text,className){const node=document.createElement(tag);if(text!==void 0)node.textContent=text;if(className)node.className=className;return node}function icon(name){const node=el("ha-icon");node.setAttribute("icon",name);return node}function iconButton(label,name,handler,disabled=false){const node=el("ha-icon-button");node.label=label;node.setAttribute("aria-label",label);node.disabled=disabled;node.append(icon(name));node.addEventListener("click",()=>{if(!node.disabled)handler()});return node}var panelHeaderStyles=`
  .ha-plus-header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--header-height, 56px);
    min-height: var(--header-height, 56px);
    padding: 0 12px;
    box-sizing: border-box;
    font-family: var(--ha-font-family-body, var(--primary-font-family, Roboto, sans-serif));
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    background: var(--app-header-background-color, var(--primary-background-color, #fafafa));
    color: var(--app-header-text-color, var(--primary-text-color, #212121));
  }
  .ha-plus-header-heading { flex: 1; min-width: 0; }
  .ha-plus-header h1 { margin: 0; font-size: 20px; font-weight: 400; line-height: 24px; overflow-wrap: anywhere; }
  .ha-plus-header-icon { width: 32px; height: 32px; object-fit: contain; flex-shrink: 0; }
  .ha-plus-header :is(ha-menu-button, ha-icon-button) { flex-shrink: 0; }
  @media (max-width: 480px) {
    .ha-plus-header { gap: 4px; padding-inline: 4px; }
    .ha-plus-header h1 { font-size: 18px; line-height: 22px; }
  }
`;var themeStyles=`${panelHeaderStyles}
  :host { display:block; color:var(--primary-text-color,#212121); font-family:var(--primary-font-family,var(--paper-font-body1_-_font-family,Roboto,sans-serif)); }
  *, *::before, *::after { box-sizing:border-box; }
  [hidden] { display:none !important; }
  a { color:var(--primary-color,#03a9f4); }
  ha-icon { flex-shrink:0; }
  button, input, select, textarea { font:inherit; }
  button { min-height:44px; padding:10px 16px; border:0; border-radius:var(--ha-button-border-radius,999px); background:var(--secondary-background-color,#f5f5f5); color:var(--primary-color,#03a9f4); cursor:pointer; font-weight:500; }
  button:hover { filter:brightness(.96); }
  button.primary { background:var(--primary-color,#03a9f4); color:var(--text-primary-color,#fff); }
  button.danger { color:var(--error-color,#db4437); }
  button:disabled { opacity:.5; cursor:default; }
  :is(button,input,select,textarea,a,summary,[tabindex]):focus-visible { outline:2px solid var(--primary-color,#03a9f4); outline-offset:3px; }
  .icon-button { display:grid; place-items:center; width:44px; height:44px; min-width:44px; padding:0; border-radius:50%; color:inherit; background:transparent; }
  .icon-button:hover { background:var(--secondary-background-color,#f5f5f5); }
  input:not([type=checkbox]):not([type=radio]), textarea { min-height:48px; border:1px solid var(--divider-color,#e0e0e0); border-radius:var(--ha-input-border-radius,14px); padding:10px 14px; color:var(--primary-text-color,#212121); background:var(--secondary-background-color,#f5f5f5); max-width:100%; }
  ha-card { display:block; background:var(--ha-card-background,var(--card-background-color,#fff)); color:var(--primary-text-color,#212121); border-radius:var(--ha-card-border-radius,12px); box-shadow:var(--ha-card-box-shadow,none); border:var(--ha-card-border-width,1px) solid var(--ha-card-border-color,var(--divider-color,#e0e0e0)); }
  .field { position:relative; min-width:0; }
  .field-label { display:block; margin-bottom:8px; color:var(--secondary-text-color,#727272); font-size:14px; }
  .combobox { display:flex; align-items:center; gap:8px; width:100%; justify-content:space-between; text-align:start; border:1px solid var(--divider-color,#e0e0e0); border-radius:14px; color:var(--primary-text-color,#212121); min-height:48px; padding:10px 14px; }
  .combobox span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .listbox { position:absolute; z-index:10; inset-inline:0; top:100%; margin-top:4px; max-height:300px; overflow:auto; padding:6px; background:var(--card-background-color,#fff); border:1px solid var(--divider-color,#e0e0e0); border-radius:14px; box-shadow:var(--ha-card-box-shadow,0 4px 16px #0003); }
  .option { display:block; width:100%; text-align:start; border-radius:10px; background:transparent; color:var(--primary-text-color,#212121); white-space:normal; overflow-wrap:anywhere; }
  .option[aria-selected=true] { color:var(--primary-color,#03a9f4); background:var(--secondary-background-color,#f5f5f5); }
  .ha-plus-content { max-width:1000px; margin:auto; padding:24px; }
  .notice { padding:12px 16px; margin-bottom:16px; background:var(--secondary-background-color,#f5f5f5); border-radius:14px; overflow-wrap:anywhere; }
  .error { color:var(--error-color,#db4437); white-space:pre-wrap; }
  dialog { font:inherit; background:var(--ha-card-background,var(--card-background-color,#fff)); color:var(--primary-text-color,#212121); border:1px solid var(--divider-color,#e0e0e0); border-radius:var(--ha-dialog-border-radius,20px); padding:24px; width:420px; max-width:calc(100% - 32px); max-height:calc(100% - 32px); overflow:auto; }
  dialog::backdrop { background:#0008; }
  dialog h2 { margin:0 0 16px; font-size:1.3rem; }
  dialog p { white-space:pre-line; overflow-wrap:anywhere; }
  dialog form { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:12px; margin-top:24px; }
  @media(max-width:700px) { .ha-plus-content { padding:16px; } .ha-plus-header h1 { font-size:18px; } }
`;var nativeStyles=`
  .ha-plus-header-heading { flex: 1; min-width: 0; }
  .ha-plus-header-heading h1 { overflow-wrap: anywhere; }
  .ha-plus-header-heading p { margin: 4px 0 0; font-size: 12px; }
  .ha-plus-dialog-message { white-space: pre-line; overflow-wrap: anywhere; padding: 8px 24px; }
  .ha-plus-dialog-actions { display: flex; flex-wrap: wrap; justify-content: end; gap: 8px; }
  ha-alert.notice { padding: 0; background: transparent; }
  ha-form.field { min-width: 0; }
  ha-dialog { --mdc-dialog-min-width: min(420px, calc(100vw - 32px)); --mdc-dialog-max-width: 560px; }
`;var appStyles=`${themeStyles}${nativeStyles}
  :host {
    container-type: inline-size;
  }

  h2 {
    font-size: 20px;
    font-weight: 500;
    margin: 0 0 16px;
  }

  h3 {
    font-size: 16px;
    margin: 0;
  }

  p {
    line-height: 1.5;
  }

  section {
    margin-bottom: 24px;
  }

  details {
    margin-top: 16px;
  }

  summary {
    cursor: pointer;
    padding: 8px 0;
  }

  .ha-plus-muted,
  .ha-plus-message {
    color: var(--secondary-text-color, #727272);
    font-size: 14px;
    overflow-wrap: anywhere;
  }

  .ha-plus-message {
    align-self: center;
  }

  .ha-plus-padded-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .ha-plus-row,
  .ha-plus-chips,
  .ha-plus-card-actions,
  .ha-plus-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ha-plus-row h3 {
    flex: 1;
  }

  .ha-plus-chips {
    margin-top: 12px;
  }

  .ha-plus-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 7px 12px;
    border-radius: 999px;
    background: var(--secondary-background-color, #f5f5f5);
    border: 1px solid var(--divider-color, #e0e0e0);
    font-size: 13px;
    overflow-wrap: anywhere;
  }

  .ha-plus-chip.active {
    color: var(--primary-color, #03a9f4);
    background: var(--primary-color-light, var(--secondary-background-color, #f5f5f5));
    border-color: var(--primary-color, #03a9f4);
  }

  .ha-plus-chip ha-icon {
    --mdc-icon-size: 18px;
  }

  .ha-plus-form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
    align-items: end;
    gap: 12px;
  }


  .ha-plus-value {
    margin: 12px 0 4px;
    font-size: 20px;
    font-weight: 500;
  }

  .ha-plus-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 16px;
  }

  .ha-plus-card-grid > ha-card {
    margin: 0;
  }

  .ha-plus-detail-row {
    padding: 12px 0;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    overflow-wrap: anywhere;
  }

  .ha-plus-detail-row:last-child {
    border: 0;
  }

  .ha-plus-create {
    margin: 16px 0;
  }

  .ha-plus-create form {
    display: flex;
    align-items: end;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 12px;
  }

  .ha-plus-compact-content {
    padding: 16px;
  }

  .ha-plus-compact .ha-plus-form-grid {
    grid-template-columns: 1fr;
  }

  .ha-plus-compact .ha-plus-card-grid {
    display: block;
  }

  .ha-plus-compact .ha-plus-group {
    margin-bottom: 12px;
    padding: 12px;
  }

  .ha-plus-detail-card {
    overflow: hidden;
  }

  .ha-plus-card-header {
    display: grid;
    align-items: center;
    cursor: pointer;
    gap: 16px;
    grid-template-columns: 64px minmax(0, 1fr);
    padding: 20px 20px 12px;
  }

  .ha-plus-card-header h2 {
    line-height: 1.3;
    margin-bottom: 4px;
    overflow-wrap: anywhere;
  }

  .ha-plus-card-header:focus-visible {
    outline-offset: -2px;
  }

  .ha-plus-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 50%;
    height: 64px;
    width: 64px;
    overflow: hidden;
  }

  .ha-plus-avatar img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }

  .ha-plus-avatar ha-icon {
    color: var(--primary-color, #03a9f4);
    --mdc-icon-size: 34px;
  }

  .ha-plus-status {
    font-weight: 500;
    text-transform: capitalize;
    overflow-wrap: anywhere;
  }

  [data-tone=success] {
    color: var(--success-color, #43a047);
  }

  [data-tone=warning] {
    color: var(--warning-color, #ff9800);
  }

  [data-tone=error] {
    color: var(--error-color, #db4437);
  }

  .ha-plus-description {
    color: var(--secondary-text-color, #727272);
    margin: 0;
    padding: 0 20px 16px;
    overflow-wrap: anywhere;
  }

  .ha-plus-stats {
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    background: var(--divider-color, #e0e0e0);
    border-block: 1px solid var(--divider-color, #e0e0e0);
  }

  .ha-plus-stat {
    display: grid;
    align-items: center;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 10px;
    min-height: 64px;
    padding: 10px 14px;
    border: 0;
    border-radius: 0;
    background: var(--card-background-color, #fff);
    color: var(--primary-text-color, #212121);
    text-align: start;
  }

  .ha-plus-stat:hover {
    background: var(--secondary-background-color, #f5f5f5);
  }

  .ha-plus-stat ha-icon {
    color: var(--state-icon-color, #44739e);
  }

  .ha-plus-stat-label {
    color: var(--secondary-text-color, #727272);
    display: block;
    font-size: 0.78rem;
  }

  .ha-plus-stat-value {
    display: block;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ha-plus-card-actions {
    padding: 16px 20px 20px;
  }

  .ha-plus-feedback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    max-width: 100%;
    position: relative;
    overflow: hidden;
  }

  button.ha-plus-feedback.success {
    background: var(--success-color, #43a047);
    opacity: 1;
    cursor: default;
  }

  .ha-plus-feedback.success::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: #fff6;
    animation: ha-plus-splash 600ms ease-out forwards;
  }

  .ha-plus-feedback.success ha-icon {
    animation: ha-plus-check-in 350ms ease-out;
  }

  .ha-plus-toolbar {
    gap: 12px;
    margin-bottom: 16px;
  }

  .ha-plus-toolbar button[aria-pressed=true] {
    background: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #fff);
  }

  .ha-plus-table {
    overflow-x: auto;
    background: var(--card-background-color, #fff);
    border: 1px solid var(--divider-color, #e0e0e0);
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .ha-plus-table table {
    border-collapse: collapse;
    width: 100%;
    white-space: nowrap;
  }

  .ha-plus-table th,
  .ha-plus-table td {
    text-align: start;
    padding: 12px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }

  .ha-plus-table input[type=checkbox] {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-color, #03a9f4);
    cursor: pointer;
  }

  .ha-plus-text-button {
    background: transparent;
    border: 0;
    padding: 4px;
    text-align: start;
  }

  @keyframes ha-plus-splash {
    from { transform: scale(0); opacity: 1; }
    to { transform: scale(2); opacity: 0; }
  }

  @keyframes ha-plus-check-in {
    from { transform: scale(0.4); }
    to { transform: scale(1); }
  }

  @media (max-width: 700px) {
    .ha-plus-form-grid {
      grid-template-columns: 1fr 1fr;
    }

    .ha-plus-form-grid .field:first-child,
    .ha-plus-form-grid .primary {
      grid-column: 1 / -1;
    }
  }

  @container (max-width: 420px) {
    .ha-plus-stats {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ha-plus-feedback.success::after,
    .ha-plus-feedback.success ha-icon {
      animation: none;
    }

    .ha-plus-feedback.success::after {
      display: none;
    }
  }
`;function haContext(){if(typeof window==="undefined")return void 0;try{return window.parent?.document.querySelector("home-assistant")?.hass||window.document.querySelector("home-assistant")?.hass}catch{return void 0}}function preferences(hass=haContext()){const locale=hass?.locale||{};const language=locale.language||hass?.language||"en";const numberLocales={comma_decimal:"en-US",decimal_comma:"de-DE",space_comma:"sv-SE"};const numberLanguage=numberLocales[locale.number_format]||(locale.number_format==="system"&&typeof navigator!=="undefined"?navigator.language:language);const direction=hass?.translationMetadata?.translations?.[language]?.isRTL||/^(ar|fa|he|ur)(-|$)/i.test(language)?"rtl":"ltr";const dateLocales={DMY:"en-GB",MDY:"en-US",YMD:"sv-SE"};const dateLanguage=dateLocales[locale.date_format]||(locale.date_format==="system"&&typeof navigator!=="undefined"?navigator.language:language);const timeLanguage=locale.time_format==="system"&&typeof navigator!=="undefined"?navigator.language:language;const languageHour12=new Intl.DateTimeFormat(timeLanguage,{hour:"numeric"}).resolvedOptions().hour12;return{dateLanguage,language,direction,numberLanguage,useGrouping:locale.number_format!=="none",timeZone:locale.time_zone==="local"?Intl.DateTimeFormat().resolvedOptions().timeZone:hass?.config?.time_zone,hour12:["12","am_pm"].includes(locale.time_format)?true:["24","twenty_four"].includes(locale.time_format)?false:languageHour12,unitSystem:{...hass?.config?.unit_system}}}function applyPreferences(host,hass){const value=preferences(hass);if(host.getAttribute("dir")!==value.direction)host.setAttribute("dir",value.direction);if(host.getAttribute("lang")!==value.language)host.setAttribute("lang",value.language);return value}function formatNumber(hass,value,options={}){const settings=preferences(hass);return new Intl.NumberFormat(settings.numberLanguage,{useGrouping:settings.useGrouping,...options}).format(value)}var en_default={save:"Save",cancel:"Cancel",close:"Close",delete:"Delete",edit:"Edit",add:"Add",refresh:"Refresh",loading:"Loading\u2026",retry:"Retry",settings:"Settings",yes:"Yes",no:"No",apply:"Apply",confirm:"Confirm",more_actions:"More actions",dashboard_load_failed:"Home Assistant's dashboard controls could not load. Reload and try again.",controls_load_failed:"Home Assistant's to-do controls could not load. Reload and try again.",component_load_failed:"Home Assistant could not load {component}. Reload and try again."};var nativeKeys={save:"ui.common.save",cancel:"ui.common.cancel",close:"ui.common.close",delete:"ui.common.delete",edit:"ui.common.edit",add:"ui.common.add",refresh:"ui.common.refresh",loading:"ui.common.loading",retry:"ui.common.retry",yes:"ui.common.yes",no:"ui.common.no",apply:"ui.common.apply"};function localize(hass,messages,key,values={}){const shortKey=key.replace(/^common\./,"");const nativeKey=nativeKeys[shortKey];const native=nativeKey&&hass?.localize?.(nativeKey);const message=native&&native!==nativeKey?native:messages[key]||en_default[shortKey]||key;return String(message).replace(/\{([\w]+)\}/g,(match,name)=>{if(!Object.hasOwn(values,name))return match;return typeof values[name]==="number"?formatNumber(hass,values[name]):String(values[name])})}function integrationUrl(domain,add=false){if(!/^[a-z0-9_]+$/.test(domain))throw new TypeError("Invalid integration domain");return add?`/config/integrations/dashboard/add?domain=${domain}`:`/config/integrations/integration/${domain}`}function navigate(host,path2){if(!path2.startsWith("/")||path2.startsWith("//"))throw new TypeError("Navigation must stay within Home Assistant");const view=host?.ownerDocument.defaultView||window.parent;view.history.pushState(null,"",path2);view.dispatchEvent(new view.CustomEvent("location-changed",{detail:{replace:false}}))}var iframePanelStyles=`${panelHeaderStyles}
  :host {
    position: relative;
    width: 100%;
    height: 100dvh;
    box-sizing: border-box;
    overflow: hidden;
    display: grid;
    grid-template-rows: var(--header-height, 56px) minmax(0, 1fr);
    min-width: 0;
    min-height: 0;
  }

  iframe {
    display: block;
    border: 0;
    width: 100%;
    height: 100%;
    min-height: 0;
  }

`;function panelHeader(title,{hass,narrow,actions=[],subtitle,domain,iconUrl,onRefresh,refreshing=false}={}){const header=el("header",void 0,"ha-plus-header");const menu=el("ha-menu-button");menu.hass=hass;menu.narrow=narrow;const heading=el("div",void 0,"ha-plus-header-heading");heading.append(el("h1",title));if(subtitle)heading.append(el("p",subtitle,"ha-plus-muted"));header.append(menu);if(iconUrl){const logo=el("img",void 0,"ha-plus-header-icon");logo.src=iconUrl;logo.alt="";header.append(logo)}header.append(heading);if(onRefresh)header.append(iconButton(localize(hass,{},"common.refresh"),"mdi:refresh",onRefresh,refreshing));header.append(...actions);if(domain&&hass?.user?.is_admin){const settings=iconButton(localize(hass,{},"settings"),"mdi:cog",()=>navigate(header,integrationUrl(domain)));settings.dataset.settings="";header.append(settings)}return header}var path="M402.016,25.999 C448.377,25.999 486.016,63.638 486.016,110 L486.016,401.999 C486.016,448.36 448.377,485.999 402.016,485.999 L110.016,485.999 C63.655,485.999 26.016,448.36 26.016,401.999 L26.016,110 C26.016,63.638 63.655,25.999 110.016,25.999 Z M161.928,336.958 C184.703,363.395 218.418,380.145 256.016,380.145 C292.551,380.145 325.422,364.328 348.147,339.174 L372.229,352.369 C383.602,358.601 397.87,354.606 404.354,343.375 C410.839,332.144 407.164,317.79 396.08,311.056 L373.171,297.138 C377.698,284.261 380.161,270.415 380.161,255.999 C380.161,194.814 335.803,143.908 277.519,133.713 L276.867,104.573 C276.578,91.608 265.984,81.248 253.016,81.248 C240.047,81.248 229.453,91.608 229.164,104.573 L228.486,134.923 C173.198,147.46 131.87,196.942 131.87,255.999 C131.87,269.293 133.964,282.101 137.84,294.112 L109.951,311.056 C98.867,317.79 95.193,332.144 101.677,343.375 C108.161,354.606 122.429,358.601 133.803,352.369 Z M256.016,186 C256.016,205.496 258.476,218.495 275.998,236.017 C293.506,253.526 306.549,256 326.016,256 C306.519,256 293.52,258.46 275.998,275.982 C258.489,293.49 256.016,306.532 256.016,326 C256.016,306.503 253.556,293.504 236.034,275.982 C218.525,258.474 205.483,256 186.016,256 C205.513,256 218.511,253.539 236.034,236.017 C253.543,218.509 256.016,205.467 256.016,186 Z M270.114,186 Q270.114,200.077 272.835,207.716 Q276.146,217.015 286.377,227.245 Q296.442,237.31 305.365,240.488 Q312.527,243.038 326.016,243.038 Q331.855,243.038 335.985,246.834 Q340.114,250.631 340.114,256 Q340.114,261.368 335.985,265.165 Q331.855,268.961 326.016,268.961 Q312.506,268.961 305.359,271.506 Q296.453,274.678 286.377,284.754 Q276.156,294.974 272.84,304.289 Q270.114,311.942 270.114,326 Q270.114,331.368 265.985,335.165 Q261.855,338.961 256.016,338.961 Q250.176,338.961 246.047,335.165 Q241.918,331.368 241.918,326 Q241.918,311.922 239.197,304.283 Q235.886,294.985 225.655,284.754 Q215.59,274.689 206.667,271.511 Q199.505,268.961 186.016,268.961 Q180.176,268.961 176.047,265.165 Q171.918,261.368 171.918,256 Q171.918,250.631 176.047,246.834 Q180.176,243.038 186.016,243.038 Q186.022,243.038 186.134,243.038 Q199.557,243.027 206.673,240.493 Q215.579,237.321 225.655,227.245 Q235.875,217.025 239.192,207.71 Q241.918,200.057 241.918,186 Q241.918,180.631 246.047,176.834 Q250.176,173.038 256.016,173.038 Q261.855,173.038 265.985,176.834 Q270.114,180.631 270.114,186 Z M256.015,233.821 Q251.875,239.327 246.412,244.79 Q239.878,251.324 233.241,256.001 Q239.881,260.679 246.412,267.21 Q251.877,272.675 256.017,278.178 Q260.157,272.672 265.62,267.21 Q272.154,260.676 278.791,255.998 Q272.151,251.321 265.62,244.79 Q260.155,239.325 256.015,233.821 Z";window.customIcons=window.customIcons||{};window.customIcons["matter-hub-plus"]={getIcon:async name=>name==="logo"?{path,viewBox:"0 0 513 512"}:void 0};var MatterHubPanel=class extends HTMLElement{set hass(value){this._hass=value;applyPreferences(this,value);this.updateSettings();if(this.menu)this.menu.hass=value}set panel(value){this._panel=value;this.updateFrame()}updateFrame(){if(!this.frame)return;const version=encodeURIComponent(this._panel?.config?.version||"");const src=`/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1&v=${version}`;if(this.frame.getAttribute("src")!==src)this.frame.src=src}set narrow(value){this._narrow=value;if(this.menu)this.menu.narrow=value}connectedCallback(){if(!this.shadowRoot){const root=this.attachShadow({mode:"open"});root.innerHTML=`
        <style>${iframePanelStyles}</style>
        <iframe name="ha-plus-matter-hub-ui" title="HA+ Matter Hub" src="/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1"></iframe>`;this.frame=root.querySelector("iframe");this.updateFrame();this.updateSettings()}this.listener=event=>this.handleRequest(event);window.addEventListener("message",this.listener)}updateSettings(){if(!this.shadowRoot)return;const existing=this.shadowRoot.querySelector("header");if(existing&&existing._admin===Boolean(this._hass?.user?.is_admin)){const menu=existing.querySelector("ha-menu-button");menu.hass=this._hass;menu.narrow=this._narrow;return}const header=panelHeader("HA+ Matter Hub",{hass:this._hass,narrow:this._narrow,domain:"ha_plus_matter_hub",iconUrl:"/ha_plus_matter_hub/logo.png",onRefresh:()=>this.frame.contentWindow.location.reload()});header._admin=Boolean(this._hass?.user?.is_admin);const previous=this.shadowRoot.querySelector("header");if(previous)previous.replaceWith(header);else this.shadowRoot.insertBefore(header,this.frame);this.menu=header.querySelector("ha-menu-button")}disconnectedCallback(){window.removeEventListener("message",this.listener)}async handleRequest(event){if(event.origin!==location.origin||event.source!==this.frame.contentWindow||event.data?.type!=="ha-plus-matter-hub-request"||event.ports.length!==1)return;const port=event.ports[0];try{const{method,path:path2,body}=event.data;const result=await this._hass.callWS({type:"ha_plus_matter_hub/request",method,path:path2,...body==null?{}:{body}});port.postMessage(result)}catch(error){port.postMessage({status:503,body:JSON.stringify({error:error.message||"The Matter engine is unavailable"})})}finally{port.close()}}};if(!customElements.get("ha-plus-matter-hub-panel"))customElements.define("ha-plus-matter-hub-panel",MatterHubPanel);
/*! Bundled license information:

@ha-plus/ui/src/iframe-panel.js:
  (*! Adapted from HA+ Matter Hub. Licensed under Apache-2.0. See ha-plus-ui.NOTICE and ha-plus-ui.LICENSE-APACHE-2.0 in the distribution. *)

@ha-plus/ui/src/index.js:
  (*! @ha-plus/ui v0.3.3 | MIT | Copyright (c) 2026 HA+ contributors | https://github.com/zvikarp/ha-plus-packages/blob/main/LICENSE *)
*/
