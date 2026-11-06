"""Configure the managed hub with credentials for this Home Assistant."""

import asyncio
from urllib.parse import urlsplit

import aiohttp
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_ACCESS_TOKEN, CONF_URL
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.network import NoURLAvailableError, get_url

from .const import DOMAIN


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """One hub runtime per Home Assistant installation."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        errors = {}
        if user_input is not None:
            url = user_input[CONF_URL].rstrip("/")
            try:
                parsed = urlsplit(url)
                port = parsed.port
                valid = (
                    parsed.scheme in ("http", "https")
                    and parsed.hostname
                    and not parsed.username
                    and not parsed.password
                    and not parsed.query
                    and not parsed.fragment
                    and (port is None or 1 <= port <= 65535)
                )
            except ValueError:
                valid = False
            if not valid:
                errors[CONF_URL] = "invalid_url"
            else:
                try:
                    async with async_get_clientsession(self.hass).get(
                        f"{url}/api/",
                        headers={
                            "Authorization": f"Bearer {user_input[CONF_ACCESS_TOKEN]}"
                        },
                        timeout=aiohttp.ClientTimeout(total=10),
                        allow_redirects=False,
                    ) as response:
                        if response.status == 401:
                            errors["base"] = "invalid_auth"
                        elif response.status != 200:
                            errors["base"] = "cannot_connect"
                except aiohttp.ClientError, asyncio.TimeoutError:
                    errors["base"] = "cannot_connect"
            if not errors:
                return self.async_create_entry(
                    title="HA+ Matter Hub",
                    data={
                        CONF_URL: url,
                        CONF_ACCESS_TOKEN: user_input[CONF_ACCESS_TOKEN],
                    },
                )
        try:
            default_url = get_url(self.hass, prefer_external=False)
        except NoURLAvailableError:
            default_url = "http://127.0.0.1:8123"
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_URL, default=default_url): str,
                    vol.Required(CONF_ACCESS_TOKEN): selector.TextSelector(
                        selector.TextSelectorConfig(
                            type=selector.TextSelectorType.PASSWORD
                        )
                    ),
                }
            ),
            errors=errors,
        )
