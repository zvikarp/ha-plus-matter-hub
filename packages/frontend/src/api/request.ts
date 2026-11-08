import { createLocalizer, haContext } from "@ha-plus/ui/ha";
import messages from "../translations/en.json";

const tr = createLocalizer(haContext, messages);
/** Relay Marketplace panel requests through HA's authenticated, admin-only WebSocket. */
export function inMarketplacePanel(): boolean {
  return (
    window.parent !== window &&
    new URLSearchParams(window.location.search).get("ha_plus_panel") === "1"
  );
}

export function request(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  if (!inMarketplacePanel()) return fetch(path, options);
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(() => {
      channel.port1.close();
      reject(new Error(tr("matter_hub_request_timed_out")));
    }, 35000);
    channel.port1.onmessage = (event) => {
      window.clearTimeout(timer);
      channel.port1.close();
      const { status, body } = event.data;
      resolve(
        new Response(status === 204 ? null : body, {
          status,
          headers: { "Content-Type": "application/json" },
        }),
      );
    };
    try {
      window.parent.postMessage(
        {
          type: "ha-plus-matter-hub-request",
          method: options.method ?? "GET",
          path,
          body:
            typeof options.body === "string"
              ? JSON.parse(options.body)
              : undefined,
        },
        window.location.origin,
        [channel.port2],
      );
    } catch (error) {
      window.clearTimeout(timer);
      channel.port1.close();
      reject(error);
    }
  });
}
