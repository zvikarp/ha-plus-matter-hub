"""Credential and URL validation for Marketplace setup."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest

from custom_components.ha_plus_matter_hub import config_flow as module


@pytest.fixture
def flow(monkeypatch):
    flow = module.ConfigFlow()
    flow.hass = SimpleNamespace()
    flow.async_set_unique_id = AsyncMock()
    flow._abort_if_unique_id_configured = Mock()
    flow.async_show_form = lambda **kwargs: kwargs
    flow.async_create_entry = lambda **kwargs: kwargs
    monkeypatch.setattr(
        module, "get_url", lambda *args, **kwargs: "http://127.0.0.1:8123"
    )
    return flow


@pytest.mark.parametrize(
    "url",
    [
        "ftp://ha.test",
        "http://user:pass@ha.test",
        "http://ha.test#fragment",
        "not-a-url",
        "http://[invalid",
        "http://ha.test:99999",
    ],
)
async def test_rejects_invalid_urls_before_sending_credentials(flow, url):
    result = await flow.async_step_user({"url": url, "access_token": "secret"})
    assert result["errors"] == {"url": "invalid_url"}


@pytest.mark.parametrize(
    "status,error",
    [(401, "invalid_auth"), (302, "cannot_connect"), (503, "cannot_connect")],
)
async def test_rejects_auth_failures_and_redirects(flow, monkeypatch, status, error):
    response = AsyncMock()
    response.__aenter__.return_value = SimpleNamespace(status=status)
    get = Mock(return_value=response)
    monkeypatch.setattr(
        module, "async_get_clientsession", lambda hass: SimpleNamespace(get=get)
    )
    result = await flow.async_step_user(
        {"url": "http://ha.test/", "access_token": "secret"}
    )
    assert result["errors"] == {"base": error}
    assert get.call_args.kwargs["allow_redirects"] is False
    assert get.call_args.kwargs["headers"]["Authorization"] == "Bearer secret"


async def test_accepts_valid_token_server_side(flow, monkeypatch):
    response = AsyncMock()
    response.__aenter__.return_value = SimpleNamespace(status=200)
    monkeypatch.setattr(
        module,
        "async_get_clientsession",
        lambda hass: SimpleNamespace(get=Mock(return_value=response)),
    )
    result = await flow.async_step_user(
        {"url": "http://ha.test/", "access_token": "secret"}
    )
    assert result["data"] == {"url": "http://ha.test", "access_token": "secret"}
