"""Prevent the managed engine from blocking Home Assistant startup."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from homeassistant.core import CoreState
from homeassistant.exceptions import ConfigEntryNotReady, HomeAssistantError

import custom_components.ha_plus_matter_hub as integration
from custom_components.ha_plus_matter_hub.const import DOMAIN


@pytest.fixture
def setup(monkeypatch):
    runtime = SimpleNamespace(
        async_start=AsyncMock(), async_stop=AsyncMock(), async_watch=AsyncMock()
    )
    tasks = []

    def schedule(coro, name):
        task = asyncio.create_task(coro)
        tasks.append(task)
        return task

    hass = SimpleNamespace(
        data={},
        state=CoreState.starting,
        is_running=True,
        async_create_background_task=schedule,
        config_entries=SimpleNamespace(async_reload=AsyncMock()),
        bus=SimpleNamespace(async_listen_once=Mock(return_value=lambda: None)),
    )
    entry = SimpleNamespace(entry_id="hub", async_on_unload=Mock())
    monkeypatch.setattr(integration, "HubRuntime", lambda *_: runtime)
    monkeypatch.setattr(integration, "async_register_frontend", AsyncMock())
    monkeypatch.setattr(integration, "async_unregister_frontend", Mock())
    callback = Mock(return_value=lambda: None)
    monkeypatch.setattr(integration, "async_at_started", callback)
    return hass, entry, runtime, callback, tasks


async def test_defers_until_started_even_when_is_running_is_true(setup):
    hass, entry, runtime, callback, tasks = setup
    assert await integration.async_setup_entry(hass, entry)
    runtime.async_start.assert_not_awaited()
    await callback.call_args.args[1](hass)
    runtime.async_start.assert_awaited_once()
    await asyncio.gather(*tasks)
    assert await integration.async_unload_entry(hass, entry)
    runtime.async_stop.assert_awaited_once()
    assert DOMAIN not in hass.data


async def test_startup_failure_cleans_up_and_schedules_retry(setup):
    hass, entry, runtime, callback, tasks = setup
    hass.state = CoreState.running
    runtime.async_start.side_effect = HomeAssistantError("Could not start")
    with pytest.raises(ConfigEntryNotReady):
        await integration.async_setup_entry(hass, entry)
    runtime.async_stop.assert_awaited_once()
    assert DOMAIN not in hass.data
