"""Check that Home Assistant authorization owns every management request."""

import asyncio
import subprocess
from pathlib import Path
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


def test_sidebar_registers_the_mono_icon_with_home_assistant():
    panel = (
        Path(__file__).resolve().parents[1]
        / "custom_components/ha_plus_matter_hub/frontend/panel.js"
    )
    result = subprocess.run(
        [
            "node",
            "--input-type=module",
            "-e",
            """
            import assert from 'node:assert/strict';
            import { pathToFileURL } from 'node:url';
            globalThis.window = {};
            globalThis.HTMLElement = class {};
            const elements = new Map();
            globalThis.customElements = {get: name => elements.get(name), define: (name, value) => elements.set(name, value)};
            await import(pathToFileURL(process.argv[1]).href);
            const icon = await window.customIcons['matter-hub-plus'].getIcon('logo');
            assert.equal(icon.viewBox, '0 0 513 512');
            assert.match(icon.path, /^M/);
            assert.equal(await window.customIcons['matter-hub-plus'].getIcon('missing'), undefined);
            assert.ok(elements.has('ha-plus-matter-hub-panel'));
            const Panel = elements.get('ha-plus-matter-hub-panel');
            const panel = new Panel();
            let src;
            let updates = 0;
            panel.frame = {
                getAttribute: () => src,
                set src(value) { src = value; updates++; },
            };
            panel.panel = {config: {version: '1.2.6'}};
            assert.equal(src, '/ha_plus_matter_hub/ui/index.html?ha_plus_panel=1&v=1.2.6');
            panel.panel = {config: {version: '1.2.6'}};
            assert.equal(updates, 1);
            panel.panel = {config: {version: '1.2.7'}};
            assert.equal(updates, 2);
        """,
            str(panel),
        ],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
