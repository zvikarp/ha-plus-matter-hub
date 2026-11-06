"""Prepare a stable Marketplace release using the HA+ Modes version policy."""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path


def version_tuple(value):
    match = re.fullmatch(r"v?(\d+)\.(\d+)\.(\d+)", value)
    if match is None:
        raise ValueError(f"Expected a stable semantic version, got {value!r}")
    return tuple(map(int, match.groups()))


def read_versions(root):
    manifest_path = root / "custom_components/ha_plus_matter_hub/manifest.json"
    manifest = json.loads(manifest_path.read_text())
    version_tuple(manifest["version"])
    # Before the first manual release the engine workspaces use 0.0.0.
    # Later releases must keep those workspaces in sync with the integration.
    for path in workspace_paths(root):
        version = json.loads(path.read_text())["version"]
        if version not in ("0.0.0", manifest["version"]):
            raise ValueError(f"{path} version must match the integration")
    runtime = json.loads((root / "marketplace/package.json").read_text())
    lock = json.loads((root / "marketplace/package-lock.json").read_text())
    if (
        runtime["version"] != lock["version"]
        or runtime["version"] != lock["packages"][""]["version"]
    ):
        raise ValueError("Runtime package and lockfile versions must match")
    return manifest_path, manifest


def workspace_paths(root):
    return [
        root / "package.json",
        root / "docs/package.json",
        *sorted((root / "apps").glob("*/package.json")),
        *sorted((root / "packages").glob("*/package.json")),
    ]


def write_engine_versions(root, version):
    for path in [*workspace_paths(root), root / "marketplace/package.json"]:
        data = json.loads(path.read_text())
        data["version"] = version
        path.write_text(json.dumps(data, indent=2) + "\n")
    path = root / "marketplace/package-lock.json"
    data = json.loads(path.read_text())
    data["version"] = data["packages"][""]["version"] = version
    path.write_text(json.dumps(data, indent=2) + "\n")


def prepare(root, bump, releases):
    if bump not in ("patch", "minor", "major"):
        raise ValueError("Unsupported version bump")
    manifest_path, manifest = read_versions(root)
    released = []
    for release in releases:
        if release.get("isDraft") or release.get("isPrerelease"):
            continue
        try:
            released.append(version_tuple(release["tagName"]))
        except ValueError:
            continue
    latest = max(released, default=(0, 0, 0))
    current = version_tuple(manifest["version"])
    if current > latest:
        next_version = current
    else:
        major, minor, patch = latest
        next_version = {
            "patch": (major, minor, patch + 1),
            "minor": (major, minor + 1, 0),
            "major": (major + 1, 0, 0),
        }[bump]
    version = ".".join(map(str, next_version))
    manifest["version"] = version
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    write_engine_versions(root, version)
    return version


def package(root, tag=None):
    _, manifest = read_versions(root)
    if tag is not None and version_tuple(tag) != version_tuple(manifest["version"]):
        raise ValueError("Release tag must match the integration version")
    subprocess.run(
        [
            sys.executable,
            str(root / "scripts/package-marketplace.py"),
            "--version",
            manifest["version"],
        ],
        cwd=root,
        check=True,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prepare_parser = commands.add_parser("prepare")
    prepare_parser.add_argument("bump", choices=["patch", "minor", "major"])
    package_parser = commands.add_parser("package")
    package_parser.add_argument("--tag")
    args = parser.parse_args()
    root = Path.cwd()
    if args.command == "prepare":
        releases = json.loads(
            subprocess.check_output(
                [
                    "gh",
                    "release",
                    "list",
                    "--limit",
                    "100",
                    "--json",
                    "tagName,isDraft,isPrerelease",
                ],
                text=True,
            )
        )
        version = prepare(root, args.bump, releases)
        with Path(os.environ["GITHUB_OUTPUT"]).open("a") as output:
            output.write(f"version={version}\ntag=v{version}\n")
    else:
        package(root, args.tag)


if __name__ == "__main__":
    main()
