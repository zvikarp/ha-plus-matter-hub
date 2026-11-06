"""Check that Home Assistant authorization owns every management request."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from homeassistant.exceptions import Unauthorized

from custom_components.ha_plus_matter_hub.const import DOMAIN
from custom_components.ha_plus_matter_hub.frontend import request


def test_non_admin_cannot_reach_engine():
    engine = SimpleNamespace(async_request=AsyncMock())
    hass = SimpleNamespace(data={DOMAIN: engine})
    connection = SimpleNamespace(user=SimpleNamespace(is_admin=False))
    with pytest.raises(Unauthorized):
        request(
            hass,
            connection,
            {
                "id": 1,
                "type": f"{DOMAIN}/request",
                "method": "GET",
                "path": "api/matter/bridges",
            },
        )
    engine.async_request.assert_not_called()


async def test_admin_request_is_relayed_without_exposing_credentials():
    engine = SimpleNamespace(async_request=AsyncMock(return_value=(200, "[]")))
    tasks = []

    def schedule(coro, name, **kwargs):
        tasks.append(asyncio.create_task(coro))

    hass = SimpleNamespace(data={DOMAIN: engine}, async_create_background_task=schedule)
    connection = SimpleNamespace(
        user=SimpleNamespace(is_admin=True),
        send_result=Mock(),
        async_handle_exception=Mock(),
    )
    request(
        hass,
        connection,
        {
            "id": 1,
            "type": f"{DOMAIN}/request",
            "method": "GET",
            "path": "api/matter/bridges",
        },
    )
    await asyncio.gather(*tasks)
    engine.async_request.assert_awaited_once_with("GET", "api/matter/bridges", None)
    connection.send_result.assert_called_once_with(1, {"status": 200, "body": "[]"})
