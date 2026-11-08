"""Register app-owned frontend assets through the shared HA+ lifecycle."""

import asyncio
from pathlib import Path

import aiohttp
import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN, PANEL, ROOT
from .ha_plus_frontend import (
    async_register_frontend as register_frontend,
)
from .ha_plus_frontend import (
    async_unregister_frontend as unregister_frontend,
)


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
    root = Path(__file__).parent
    await register_frontend(
        hass,
        domain=DOMAIN,
        module_url="/ha_plus_matter_hub/panel.js",
        static_paths={
            "/ha_plus_matter_hub/panel.js": root / "frontend/panel.js",
            f"{ROOT}/icon.js": root / "frontend/icon.js",
            f"{ROOT}/logo.png": root / "brand/icon.png",
            f"{ROOT}/ui": runtime.root / "dist/frontend",
        },
        webcomponent_name="ha-plus-matter-hub-panel",
        frontend_url_path=PANEL,
        sidebar_title="HA+ Matter Hub",
        sidebar_icon="matter-hub-plus:logo",
        require_admin=True,
        commands=(request,),
    )


def async_unregister_frontend(hass):
    unregister_frontend(hass, PANEL)
