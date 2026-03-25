"""
UE5 Editor Utility – List all Blueprint assets under /Game.

Run inside the Unreal Editor Python console or via
  Edit ▸ Developer Tools ▸ Output Log  (Python tab).

Prints every Blueprint asset path found in /Game (recursive),
grouped by subfolder, with a total count at the end.
"""

from __future__ import annotations

try:
    import unreal
except ImportError:  # running outside UE5 editor (e.g. IDE lint)
    pass

from collections import defaultdict
from typing import Dict, List


def list_blueprint_assets(root: str = "/Game") -> List[str]:
    """Return sorted list of Blueprint asset paths under *root*."""
    all_assets = unreal.EditorAssetLibrary.list_assets(
        root,
        recursive=True,
        include_folder=False,
    )

    blueprints = [
        asset
        for asset in all_assets
        if unreal.EditorAssetLibrary.find_asset_data(asset).asset_class_path.asset_name
        in ("Blueprint", "WidgetBlueprint", "AnimBlueprint")
    ]

    blueprints.sort()
    return blueprints


def _folder_of(asset_path: str) -> str:
    """Return the parent folder portion of an asset path."""
    return "/".join(asset_path.split("/")[:-1])


def main() -> None:
    unreal.log("=" * 60)
    unreal.log("  Blueprint Asset Scanner")
    unreal.log("=" * 60)

    blueprints = list_blueprint_assets()

    if not blueprints:
        unreal.log_warning("No Blueprint assets found under /Game.")
        return

    # Group by folder for readability
    by_folder: Dict[str, List[str]] = defaultdict(list)
    for bp in blueprints:
        by_folder[_folder_of(bp)].append(bp.split("/")[-1])

    for folder in sorted(by_folder):
        unreal.log(f"\n📁 {folder}/")
        for name in by_folder[folder]:
            unreal.log(f"   • {name}")

    unreal.log(f"\n{'─' * 40}")
    unreal.log(f"  Total Blueprints: {len(blueprints)}")
    unreal.log("=" * 60)


if __name__ == "__main__":
    main()
