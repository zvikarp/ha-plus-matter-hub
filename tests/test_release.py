"""Verify the manual release policy without publishing or bumping source files."""

import json

import pytest

from scripts.release import prepare


@pytest.fixture
def project(tmp_path):
    source = tmp_path / "custom_components/ha_plus_matter_hub"
    source.mkdir(parents=True)
    (source / "manifest.json").write_text(json.dumps({"version": "1.2.0"}))
    for name in (
        "package.json",
        "docs/package.json",
        "apps/engine/package.json",
        "packages/common/package.json",
    ):
        path = tmp_path / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({"version": "0.0.0"}))
    (tmp_path / "marketplace").mkdir()
    (tmp_path / "marketplace/package.json").write_text(json.dumps({"version": "1.0.0"}))
    (tmp_path / "marketplace/package-lock.json").write_text(
        json.dumps({"version": "1.0.0", "packages": {"": {"version": "1.0.0"}}})
    )
    return tmp_path


@pytest.mark.parametrize(
    ("bump", "expected"), [("patch", "1.2.1"), ("minor", "1.3.0"), ("major", "2.0.0")]
)
def test_next_stable_version(project, bump, expected):
    assert prepare(project, bump, [{"tagName": "v1.2.0"}]) == expected
    assert (
        json.loads(
            (project / "custom_components/ha_plus_matter_hub/manifest.json").read_text()
        )["version"]
        == expected
    )
    for name in (
        "package.json",
        "docs/package.json",
        "apps/engine/package.json",
        "packages/common/package.json",
        "marketplace/package.json",
        "marketplace/package-lock.json",
    ):
        assert json.loads((project / name).read_text())["version"] == expected
    assert (
        json.loads((project / "marketplace/package-lock.json").read_text())["packages"][
            ""
        ]["version"]
        == expected
    )


def test_first_or_prepared_version_is_reused(project):
    assert prepare(project, "major", []) == "1.2.0"
    assert (
        prepare(
            project,
            "patch",
            [
                {"tagName": "v0.1.0"},
                {"tagName": "v99.0.0", "isDraft": True},
                {"tagName": "v2.0.0-rc.1", "isPrerelease": True},
                {"tagName": "invalid"},
            ],
        )
        == "1.2.0"
    )


def test_invalid_bump_is_rejected_without_mutation(project):
    manifest = project / "custom_components/ha_plus_matter_hub/manifest.json"
    before = manifest.read_bytes()
    with pytest.raises(ValueError):
        prepare(project, "invalid", [])
    assert manifest.read_bytes() == before


def test_workspace_drift_blocks_before_version_mutation(project):
    path = project / "packages/common/package.json"
    path.write_text(json.dumps({"version": "9.0.0"}))
    manifest = project / "custom_components/ha_plus_matter_hub/manifest.json"
    before = manifest.read_bytes()
    with pytest.raises(ValueError, match="must match"):
        prepare(project, "patch", [])
    assert manifest.read_bytes() == before


def test_release_tag_guard_precedes_packaging(project):
    from unittest.mock import patch

    from scripts.release import package

    with patch("scripts.release.subprocess.run") as run:
        with pytest.raises(ValueError, match="tag must match"):
            package(project, "v99.0.0")
        run.assert_not_called()
        package(project, "v1.2.0")
        assert run.call_args.args[0][-2:] == ["--version", "1.2.0"]


def test_version_bump_preserves_manifest_formatting(project):
    manifest = project / "custom_components/ha_plus_matter_hub/manifest.json"
    original = manifest.read_text()
    prepare(project, "patch", [{"tagName": "v1.2.0"}])
    assert manifest.read_text() == original.replace('"1.2.0"', '"1.2.1"')
