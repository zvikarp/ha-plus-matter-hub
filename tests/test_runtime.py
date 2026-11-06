"""Exercise real managed subprocesses without contacting Home Assistant or devices."""

import asyncio
from pathlib import Path
from types import SimpleNamespace

import aiohttp
import pytest
from homeassistant.exceptions import HomeAssistantError

from custom_components.ha_plus_matter_hub import runtime as module
from custom_components.ha_plus_matter_hub.runtime import HubRuntime, node_executable

ENGINE = """
const http = require('node:http');
const expected = 'Basic ' + Buffer.from('ha_plus_matter_hub:' + process.env.HAMH_HTTP_AUTH_PASSWORD).toString('base64');
const server = http.createServer((req, res) => {
  if (req.headers.authorization !== expected) { res.writeHead(401); res.end(); return; }
  res.setHeader('Content-Type','application/json');
  res.end(JSON.stringify({ host: process.env.HAMH_HTTP_HOST, bridges: [] }));
});
server.listen(Number(process.env.HAMH_HTTP_PORT), process.env.HAMH_HTTP_HOST);
process.on('SIGTERM', () => server.close(() => process.exit(0)));
"""


@pytest.fixture
async def managed(tmp_path, monkeypatch):
    async def execute(func):
        return await asyncio.to_thread(func)

    hass = SimpleNamespace(
        config=SimpleNamespace(path=lambda *args: str(tmp_path.joinpath(*args))),
        async_add_executor_job=execute,
        async_create_background_task=lambda coro, name: asyncio.create_task(coro),
    )
    entry = SimpleNamespace(
        data={"url": "http://127.0.0.1:8123", "access_token": "test-secret"}
    )
    runtime = HubRuntime(hass, entry)
    runtime.root = tmp_path / "runtime"
    cli = runtime.root / "dist/backend/cli.js"
    cli.parent.mkdir(parents=True)
    cli.write_text(ENGINE)
    async with aiohttp.ClientSession() as session:
        monkeypatch.setattr(module, "async_get_clientsession", lambda hass: session)
        yield runtime
        await runtime.async_stop()


async def test_real_node_runtime_is_manifest_dependency():
    process = await asyncio.create_subprocess_exec(
        node_executable(), "--version", stdout=asyncio.subprocess.PIPE
    )
    output, _ = await process.communicate()
    assert process.returncode == 0
    assert output.startswith(b"v24.19.")


async def test_start_requests_stop_and_preserve_pairing_storage(managed):
    await managed.async_start()
    process = managed.process
    status, body = await managed.async_request("GET", "api/matter/bridges?_s=123")
    assert status == 200
    assert '"host":"127.0.0.1"' in body
    data = managed.storage / "pairings.json"
    data.write_text("existing pairing")
    await managed.async_stop()
    assert process.returncode == 0
    assert not managed.ready
    assert data.read_text() == "existing pairing"


@pytest.mark.parametrize(
    "path",
    [
        "https://example.com/api/matter",
        "//example.com/api/matter",
        "api/matter/../config",
        "api/matter/%2e%2e/config",
        "api/matter?next=http://example.com",
        "api/matter#fragment",
        "api/config",
    ],
)
async def test_rejects_arbitrary_proxy_paths_before_network_request(managed, path):
    with pytest.raises(HomeAssistantError, match="Unsupported"):
        await managed.async_request("GET", path)


async def test_failed_start_has_no_orphan_process(managed):
    (managed.root / "dist/backend/cli.js").write_text("process.exit(1)")
    with pytest.raises(HomeAssistantError, match="exited"):
        await managed.async_start()
    assert managed.process.returncode == 1
    assert not managed.ready


async def test_restarts_crashed_child_and_cleans_up_monitor(managed):
    await managed.async_start()
    old = managed.process
    managed.monitor = asyncio.create_task(managed.async_watch())
    old.kill()
    async with asyncio.timeout(10):
        while managed.process is old or not managed.ready:
            await asyncio.sleep(0.05)
    assert managed.process.pid != old.pid
    await managed.async_stop()
    assert managed.monitor.done()
    assert managed.process.returncode is not None


async def test_complete_packaged_engine_connects_to_ha_and_serves_api(managed):
    """Use the production engine with a device-free HA WebSocket fixture."""
    import json

    from aiohttp import web

    root = (
        Path(__file__).resolve().parents[1]
        / "custom_components/ha_plus_matter_hub/runtime"
    )
    if not (root / "dist/backend/cli.js").is_file():
        pytest.skip("Build the Marketplace ZIP first")
    calls = []

    async def websocket(request):
        socket = web.WebSocketResponse()
        await socket.prepare(request)
        await socket.send_json({"type": "auth_required", "ha_version": "2026.11.0"})
        auth = await socket.receive_json()
        assert auth["access_token"] == "test-secret"
        await socket.send_json({"type": "auth_ok", "ha_version": "2026.11.0"})
        async for message in socket:
            if message.type != aiohttp.WSMsgType.TEXT:
                continue
            data = json.loads(message.data)
            calls.append(data["type"])
            result = (
                {"state": "RUNNING", "unit_system": {"temperature": "°C"}}
                if data["type"] == "get_config"
                else []
            )
            await socket.send_json(
                {"id": data["id"], "type": "result", "success": True, "result": result}
            )
        return socket

    app = web.Application()
    app.router.add_get("/api/websocket", websocket)
    runner = web.AppRunner(app)
    await runner.setup()
    port = module.free_port()
    await web.TCPSite(runner, "127.0.0.1", port).start()
    managed.entry.data["url"] = f"http://127.0.0.1:{port}"
    managed.root = root
    try:
        await managed.async_start()
        status, body = await managed.async_request("GET", "api/matter/bridges")
        assert status == 200
        assert json.loads(body) == []
        assert "get_config" in calls
        assert "config/entity_registry/list" in calls
    finally:
        await managed.async_stop()
        await runner.cleanup()
