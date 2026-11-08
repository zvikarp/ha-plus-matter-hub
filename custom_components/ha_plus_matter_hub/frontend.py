"""Admin-only API relay and a sidebar panel with no client-side credentials."""

import asyncio
from pathlib import Path

import aiohttp
import voluptuous as vol
from homeassistant.components import frontend, websocket_api
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.panel_custom import async_register_panel
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, PANEL, ROOT


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/request",
        vol.Required("method"): vol.In(["GET", "POST", "PUT", "DELETE"]),
        vol.Required("path"): str,
        vol.Optional("body"): vol.Any(dict, None),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def request(hass, connection, msg):
    runtime = hass.data.get(DOMAIN)
    if runtime is None:
        connection.send_error(msg["id"], "not_loaded", "Matter Hub is not loaded")
        return
    try:
        status, body = await runtime.async_request(
            msg["method"], msg["path"], msg.get("body")
        )
    except (
        HomeAssistantError,
        OSError,
        aiohttp.ClientError,
        asyncio.TimeoutError,
    ) as err:
        connection.send_error(msg["id"], "engine_unavailable", str(err))
        return
    connection.send_result(msg["id"], {"status": status, "body": body})


async def async_register_frontend(hass, runtime):
    from homeassistant.loader import async_get_integration

    integration = await async_get_integration(hass, DOMAIN)
    module = f"{ROOT}/panel.js?v={integration.version}"
    if not hass.data.get(f"{DOMAIN}_frontend"):
        root = Path(__file__).parent
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    f"{ROOT}/panel.js",
                    str(root / "frontend/panel.js"),
                    cache_headers=False,
                ),
                StaticPathConfig(
                    f"{ROOT}/icon.js",
                    str(root / "frontend/icon.js"),
                    cache_headers=False,
                ),
                StaticPathConfig(
                    f"{ROOT}/logo.png",
                    str(root / "brand/icon.png"),
                    cache_headers=False,
                ),
                StaticPathConfig(
                    f"{ROOT}/ui",
                    str(runtime.root / "dist/frontend"),
                    cache_headers=False,
                ),
            ]
        )
        add_extra_js_url(hass, module)
        websocket_api.async_register_command(hass, request)
        hass.data[f"{DOMAIN}_frontend"] = True
    await async_register_panel(
        hass,
        webcomponent_name="ha-plus-matter-hub-panel",
        frontend_url_path=PANEL,
        sidebar_title="HA+ Matter Hub",
        sidebar_icon="matter-hub-plus:logo",
        module_url=module,
        require_admin=True,
        config={"version": str(integration.version)},
    )


def async_unregister_frontend(hass):
    frontend.async_remove_panel(hass, PANEL)
