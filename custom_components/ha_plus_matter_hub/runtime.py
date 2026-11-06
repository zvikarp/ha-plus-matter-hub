"""Own the pinned Node engine as an integration-managed child process."""

import asyncio
import importlib.util
import logging
import os
import re
import secrets
import socket
from contextlib import suppress
from pathlib import Path
from urllib.parse import urlsplit

import aiohttp
from homeassistant.const import CONF_ACCESS_TOKEN, CONF_URL
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)
API_PATH = re.compile(
    r"api/matter(?:/bridges(?:/[a-zA-Z0-9_-]+(?:/(?:devices|actions/factory-reset))?)?)?"
)


def node_executable():
    """Resolve only the runtime installed by the manifest, never a host PATH binary."""
    spec = importlib.util.find_spec("nodejs_wheel")
    if spec is None or spec.origin is None:
        raise HomeAssistantError("The packaged Node.js runtime is unavailable")
    root = Path(spec.origin).parent
    candidates = (root / "bin/node", root / "node.exe")
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    raise HomeAssistantError("The packaged Node.js executable is unavailable")


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


class HubRuntime:
    def __init__(self, hass, entry):
        self.hass = hass
        self.entry = entry
        self.process = None
        self.port = None
        self.password = secrets.token_urlsafe(32)
        self.monitor = None
        self.reader = None
        self.stopping = False
        self.ready = False
        self.root = Path(__file__).parent / "runtime"
        self.storage = Path(hass.config.path(".storage", DOMAIN))

    async def async_start(self):
        if self.process is not None and self.process.returncode is None:
            return
        cli = self.root / "dist/backend/cli.js"
        if not cli.is_file():
            raise HomeAssistantError(
                "Missing bundled engine. Install the Marketplace release ZIP, or build the development package first."
            )
        executable = await self.hass.async_add_executor_job(node_executable)
        await self.hass.async_add_executor_job(
            lambda: self.storage.mkdir(parents=True, exist_ok=True, mode=0o700)
        )
        self.port = await self.hass.async_add_executor_job(free_port)
        env = {
            key: value
            for key, value in os.environ.items()
            if not key.startswith("HAMH_")
        }
        env.update(
            {
                "NODE_ENV": "production",
                "HAMH_HOME_ASSISTANT_URL": self.entry.data[CONF_URL],
                "HAMH_HOME_ASSISTANT_ACCESS_TOKEN": self.entry.data[CONF_ACCESS_TOKEN],
                "HAMH_STORAGE_LOCATION": str(self.storage),
                "HAMH_HTTP_PORT": str(self.port),
                "HAMH_HTTP_HOST": "127.0.0.1",
                "HAMH_HTTP_AUTH_USERNAME": DOMAIN,
                "HAMH_HTTP_AUTH_PASSWORD": self.password,
                "HAMH_DISABLE_LOG_COLORS": "true",
            }
        )
        self.process = await asyncio.create_subprocess_exec(
            executable,
            str(cli),
            "start",
            env=env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            limit=1024 * 1024,
        )
        self.reader = self.hass.async_create_background_task(
            self._read_output(self.process), "Matter Hub output"
        )
        try:
            async with asyncio.timeout(40):
                while self.process.returncode is None:
                    try:
                        status, _ = await self.async_request(
                            "GET", "api/matter", require_ready=False
                        )
                        if status == 200:
                            self.ready = True
                            return
                    except aiohttp.ClientError, asyncio.TimeoutError:
                        pass
                    await asyncio.sleep(0.25)
                raise HomeAssistantError(
                    "The Matter engine exited during startup; see the integration logs"
                )
        except BaseException:
            await self._stop_process()
            raise
        raise HomeAssistantError("The Matter engine failed to start")

    async def _read_output(self, process):
        while line := await process.stdout.readline():
            text = line.decode(errors="replace").rstrip()
            for secret in (self.password, self.entry.data[CONF_ACCESS_TOKEN]):
                text = text.replace(secret, "[redacted]")
            _LOGGER.debug("Engine: %s", text)

    async def async_watch(self):
        """Recover a failed engine without an unbounded rapid restart loop."""
        for attempt in range(6):
            await self.process.wait()
            if self.stopping:
                return
            self.ready = False
            if attempt == 5:
                _LOGGER.error(
                    "Matter engine recovery exhausted; reload the integration"
                )
                return
            _LOGGER.warning("Matter engine stopped; restart attempt %s/5", attempt + 1)
            await asyncio.sleep(min(2**attempt, 30))
            try:
                await self.async_start()
            except OSError, HomeAssistantError, asyncio.TimeoutError:
                _LOGGER.error("Matter engine restart failed")
        _LOGGER.error("Matter engine recovery exhausted; reload the integration")

    async def _stop_process(self):
        self.ready = False
        if self.process is not None and self.process.returncode is None:
            with suppress(ProcessLookupError):
                self.process.terminate()
            try:
                await asyncio.wait_for(self.process.wait(), 10)
            except asyncio.TimeoutError:
                with suppress(ProcessLookupError):
                    self.process.kill()
                await self.process.wait()
        if self.reader is not None:
            self.reader.cancel()
            with suppress(asyncio.CancelledError):
                await self.reader
            self.reader = None

    async def async_stop(self):
        self.stopping = True
        if self.monitor is not None:
            self.monitor.cancel()
            with suppress(asyncio.CancelledError):
                await self.monitor
        await self._stop_process()

    async def async_request(self, method, path, body=None, *, require_ready=True):
        parsed = urlsplit(path)
        if (
            method not in ("GET", "POST", "PUT", "DELETE")
            or parsed.scheme
            or parsed.netloc
            or parsed.fragment
            or not API_PATH.fullmatch(parsed.path)
            or (parsed.query and not re.fullmatch(r"_s=\d+", parsed.query))
        ):
            raise HomeAssistantError("Unsupported hub API request")
        if self.port is None or (require_ready and not self.ready):
            raise HomeAssistantError("The Matter engine is not ready")
        async with async_get_clientsession(self.hass).request(
            method,
            f"http://127.0.0.1:{self.port}/{path}",
            json=body if body is not None else None,
            headers={"Authorization": aiohttp.encode_basic_auth(DOMAIN, self.password)},
            timeout=aiohttp.ClientTimeout(total=30),
            allow_redirects=False,
        ) as response:
            payload = bytearray()
            async for chunk in response.content.iter_chunked(65536):
                payload.extend(chunk)
                if len(payload) > 8 * 1024 * 1024:
                    raise HomeAssistantError("Hub response exceeds the supported size")
            return response.status, payload.decode("utf-8")
