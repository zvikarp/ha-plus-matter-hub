"""Validate the exact archive layout and runtime metadata used by Marketplace."""

import json
from pathlib import Path
from zipfile import ZipFile

import pytest

ROOT = Path(__file__).resolve().parents[1]


def test_marketplace_manifest_and_locked_engine_dependencies():
    component = json.loads(
        (ROOT / "custom_components/ha_plus_matter_hub/manifest.json").read_text()
    )
    marketplace = json.loads((ROOT / "hacs.json").read_text())
    assert component["requirements"] == ["nodejs-wheel-binaries==24.19.0"]
    assert marketplace["zip_release"]
    assert marketplace["filename"] == "ha_plus_matter_hub.zip"
    app = json.loads((ROOT / "apps/ha-plus-matter-hub/package.json").read_text())
    locked = json.loads((ROOT / "marketplace/package-lock.json").read_text())
    assert locked["packages"][""]["dependencies"] == app["dependencies"]


def test_built_release_contains_all_runtime_files():
    path = ROOT / "ha_plus_matter_hub.zip"
    if not path.exists():
        pytest.skip("Build the Marketplace package to validate its release contents")
    with ZipFile(path) as archive:
        names = set(archive.namelist())
        assert {
            "manifest.json",
            "config_flow.py",
            "__init__.py",
            "runtime/dist/backend/cli.js",
            "runtime/dist/frontend/index.html",
            "frontend/panel.js",
            "frontend/icon.js",
            "runtime/node_modules/@matter/nodejs/package.json",
        } <= names
        assert not any(
            "__pycache__" in name or name.startswith("custom_components/")
            for name in names
        )
        assert (
            "/ha_plus_matter_hub/ui/"
            in archive.read("runtime/dist/frontend/index.html").decode()
        )
