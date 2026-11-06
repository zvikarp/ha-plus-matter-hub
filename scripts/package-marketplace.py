"""Build the complete Marketplace ZIP, including locked JavaScript dependencies."""

import argparse
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "ha_plus_matter_hub"


def package(version=None):
    component = ROOT / "custom_components" / DOMAIN
    manifest = json.loads((component / "manifest.json").read_text())
    version = version or manifest["version"]
    if not re.fullmatch(r"\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?", version):
        raise ValueError("Invalid release version")
    engine = ROOT / "apps/ha-plus-matter-hub/dist"
    if not (engine / "backend/cli.js").is_file():
        raise ValueError("Run pnpm build first")
    dependencies = json.loads(
        (ROOT / "apps/ha-plus-matter-hub/package.json").read_text()
    )["dependencies"]
    locked = json.loads((ROOT / "marketplace/package.json").read_text())["dependencies"]
    if dependencies != locked:
        raise ValueError(
            "Update marketplace/package.json and its npm lockfile to match engine dependencies"
        )
    with tempfile.TemporaryDirectory() as temp:
        runtime = Path(temp)
        for filename in ("package.json", "package-lock.json"):
            shutil.copyfile(ROOT / "marketplace" / filename, runtime / filename)
        subprocess.run(
            [
                "npm",
                "ci",
                "--prefix",
                str(runtime),
                "--ignore-scripts",
                "--omit=dev",
                "--omit=optional",
                "--registry=https://registry.npmjs.org",
            ],
            check=True,
        )
        # The engine resolves its CLI version from this runtime package.
        runtime_manifest = json.loads((runtime / "package.json").read_text())
        runtime_manifest["version"] = version
        (runtime / "package.json").write_text(
            json.dumps(runtime_manifest, indent=2) + "\n"
        )
        runtime_lock = json.loads((runtime / "package-lock.json").read_text())
        runtime_lock["version"] = runtime_lock["packages"][""]["version"] = version
        (runtime / "package-lock.json").write_text(
            json.dumps(runtime_lock, indent=2) + "\n"
        )
        shutil.copytree(engine, runtime / "dist")
        html = runtime / "dist/frontend/index.html"
        html.write_text(
            re.sub(
                r"<!-- BASE -->[\s\S]*?<!-- /BASE -->",
                '<base href="/ha_plus_matter_hub/ui/" />',
                html.read_text(),
            )
        )
        # Fail before publishing if the archive cannot resolve its packaged engine.
        subprocess.run(
            ["node", str(runtime / "dist/backend/cli.js"), "--help"],
            stdout=subprocess.DEVNULL,
            check=True,
        )
        destination = component / "runtime"
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(runtime, destination, ignore=shutil.ignore_patterns(".bin"))
    output = ROOT / f"{DOMAIN}.zip"
    manifest["version"] = version
    with ZipFile(output, "w", ZIP_DEFLATED) as archive:
        for path in sorted(component.rglob("*")):
            if (
                path.is_file()
                and "__pycache__" not in path.parts
                and path.suffix != ".pyc"
            ):
                relative = path.relative_to(component)
                if relative.as_posix() == "manifest.json":
                    archive.writestr(
                        "manifest.json", json.dumps(manifest, indent=2) + "\n"
                    )
                else:
                    archive.write(path, relative)
    print(f"Built {output.name} for {version} ({output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version")
    package(parser.parse_args().version)
