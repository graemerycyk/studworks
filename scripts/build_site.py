#!/usr/bin/env python3
"""Validate and package only the public static assets, without a framework or service."""
from pathlib import Path
from shutil import copy2
from check_site import ROOT, check


def build():
    check()
    output = ROOT / "dist"
    files = [ROOT / name for name in ("index.html", "og.png", "CNAME")]
    for name in ("assets", "projects", "journal", "admin", "privacy", "terms"):
        files.extend(path for path in (ROOT / name).rglob("*") if path.is_file())
    # Use a strict allowlist: source control, scripts, README and private app files
    # never enter the published artifact. Fail if an old build has unexpected files.
    expected = {path.relative_to(ROOT) for path in files}
    if output.exists():
        unexpected = {path.relative_to(output) for path in output.rglob("*") if path.is_file()} - expected
        if unexpected:
            raise SystemExit(f"Unexpected files in dist; inspect before rebuilding: {sorted(unexpected)}")
    for source in files:
        target = output / source.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        copy2(source, target)
    print(f"Built {len(files)} public files in {output}")


if __name__ == "__main__":
    build()
