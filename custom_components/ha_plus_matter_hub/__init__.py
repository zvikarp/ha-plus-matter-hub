"""Run HA+ Matter Hub entirely from a Marketplace integration."""

import asyncio
import logging

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import CoreState
from homeassistant.exceptions import ConfigEntryNotReady, HomeAssistantError
from homeassistant.helpers.start import async_at_started

from .const import DOMAIN
from .frontend import async_register_frontend, async_unregister_frontend
from .runtime import HubRuntime

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(hass, entry):
    runtime = HubRuntime(hass, entry)
    hass.data[DOMAIN] = runtime

    async def start(_hass):
        try:
            await runtime.async_start()
            runtime.monitor = hass.async_create_background_task(
                runtime.async_watch(), "Matter Hub supervision"
            )
        except (OSError, HomeAssistantError, asyncio.TimeoutError) as err:
            _LOGGER.error("Matter Hub could not start: %s", err)
            raise ConfigEntryNotReady("Matter Hub engine could not start") from err

    try:
        await async_register_frontend(hass, runtime)
        if hass.state is CoreState.running:
            await start(hass)
        else:

            async def after_start(_hass):
                try:
                    await start(hass)
                except ConfigEntryNotReady:
                    await hass.config_entries.async_reload(entry.entry_id)

            entry.async_on_unload(async_at_started(hass, after_start))
    except BaseException:
        await runtime.async_stop()
        async_unregister_frontend(hass)
        hass.data.pop(DOMAIN, None)
        raise

    async def stop(event):
        await runtime.async_stop()

    entry.async_on_unload(hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, stop))
    return True


async def async_unload_entry(hass, entry):
    runtime = hass.data.pop(DOMAIN, None)
    if runtime is not None:
        await runtime.async_stop()
    async_unregister_frontend(hass)
    return True
