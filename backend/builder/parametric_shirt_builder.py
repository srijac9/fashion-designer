"""
Parametric shirt builder.

Turns a typed shirt spec plus interpreted metadata into a deterministic garment
blueprint that can later be exported as a real shirt GLB positioned on top of
the mannequin.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from builder.glb_exporter import ShirtGlbExporter


class ParametricShirtBuilder:
    """Builds a procedural shirt blueprint from a garment spec."""

    def __init__(self, workspace_root: Path | None = None):
        self.workspace_root = workspace_root or Path(__file__).resolve().parents[1]
        self.generated_root = self.workspace_root / "generated"
        self.exporter = ShirtGlbExporter()

    def build(self, spec: dict[str, Any]) -> dict[str, Any]:
        family = self._infer_family(spec)
        measurements = self._measurements_for(spec, family)
        panels = self._build_panels(spec, family, measurements)
        artwork_zones = self._build_artwork_zones(spec)
        blueprint_id = f"{spec.get('id', 'shirt')}-blueprint"
        style_tags = list(spec.get("_styleTags", []))

        blueprint = {
            "blueprintId": blueprint_id,
            "generationMode": "procedural-shirt-builder",
            "family": family,
            "measurements": measurements,
            "panels": panels,
            "artworkZones": artwork_zones,
            "constructionNotes": self._construction_notes(spec, family),
            "styleTags": style_tags,
        }

        export_folder = self.generated_root / str(spec.get("id", "shirt-design"))
        export_folder.mkdir(parents=True, exist_ok=True)
        blueprint_path = export_folder / "shirt_blueprint.json"
        blueprint_path.write_text(json.dumps(blueprint, indent=2), encoding="utf-8")
        glb_path = export_folder / "generated_shirt.glb"
        export_metadata = self.exporter.export(spec, blueprint, glb_path)
        design_id = str(spec.get("id", "shirt-design"))

        generated_asset = {
            "assetId": f"{spec.get('id', 'shirt')}-generated-shirt",
            "format": "glb",
            "exportStatus": "glb-generated",
            "outputPath": str(glb_path.as_posix()),
            "outputUri": f"/generated/{design_id}/generated_shirt.glb",
            "manifestPath": str(blueprint_path.as_posix()),
            "manifestUri": f"/generated/{design_id}/shirt_blueprint.json",
            "mannequinAssetUri": "/assets/models/female_mannequin.glb",
            "layeringMode": "shirt-over-mannequin",
            "vertexCount": export_metadata["vertexCount"],
            "triangleCount": export_metadata["triangleCount"],
            "fileSizeBytes": export_metadata["fileSizeBytes"],
        }

        return {
            "garmentBlueprint": blueprint,
            "generatedShirtAsset": generated_asset,
        }

    def _infer_family(self, spec: dict[str, Any]) -> str:
        sleeve = spec.get("sleeveLength")
        explicit_family = {
            "sleeveless": "tank",
            "short": "tee",
            "long": "long-sleeve",
        }.get(sleeve)
        if explicit_family:
            return explicit_family

        hinted_family = spec.get("_familyHint")
        if hinted_family in {"tank", "tee", "long-sleeve"}:
            return hinted_family

        return "tee"

    def _measurements_for(self, spec: dict[str, Any], family: str) -> dict[str, float]:
        fit = spec.get("fit", "regular")
        hem = spec.get("hemLength", "regular")
        neckline = spec.get("neckline", "crew")

        fit_scale = {"slim": 0.92, "regular": 1.0, "relaxed": 1.12}.get(fit, 1.0)
        hem_length = {"cropped": 0.84, "regular": 1.0, "extended": 1.12}.get(hem, 1.0)
        sleeve_length = {"tank": 4.0, "tee": 24.0, "long-sleeve": 58.0}[family]
        sleeve_opening = {"tank": 18.0, "tee": 16.0, "long-sleeve": 10.0}[family]
        neckline_depth = {
            "crew": 8.5,
            "v-neck": 15.5,
            "polo": 13.5,
            "henley": 12.5,
        }.get(neckline, 8.5)
        neckline_width = {
            "crew": 18.0,
            "v-neck": 17.0,
            "polo": 16.5,
            "henley": 15.5,
        }.get(neckline, 18.0)

        return {
            "shoulderWidth": round(38.0 * fit_scale, 2),
            "chestWidth": round(48.0 * fit_scale, 2),
            "waistWidth": round(44.0 * fit_scale, 2),
            "hemWidth": round(46.0 * fit_scale, 2),
            "bodyLength": round(62.0 * hem_length, 2),
            "armholeDepth": round(22.0 * fit_scale, 2),
            "sleeveLength": sleeve_length,
            "sleeveOpeningWidth": sleeve_opening,
            "necklineWidth": neckline_width,
            "necklineDepth": neckline_depth,
        }

    def _build_panels(
        self,
        spec: dict[str, Any],
        family: str,
        measurements: dict[str, float],
    ) -> list[dict[str, Any]]:
        chest = measurements["chestWidth"]
        waist = measurements["waistWidth"]
        hem = measurements["hemWidth"]
        length = measurements["bodyLength"]
        armhole = measurements["armholeDepth"]
        shoulder = measurements["shoulderWidth"]
        sleeve_length = measurements["sleeveLength"]
        sleeve_opening = measurements["sleeveOpeningWidth"]
        neck_width = measurements["necklineWidth"]
        neck_depth = measurements["necklineDepth"]

        half_shoulder = shoulder / 2
        half_chest = chest / 2
        half_waist = waist / 2
        half_hem = hem / 2
        shoulder_y = 8.0
        bust_y = armhole + 12.0
        waist_y = length * 0.58

        front_panel = {
            "id": "front-panel",
            "kind": "front",
            "polyline": [
                [150 - half_shoulder, shoulder_y],
                [150 - half_chest, bust_y],
                [150 - half_waist, waist_y],
                [150 - half_hem, length],
                [150 + half_hem, length],
                [150 + half_waist, waist_y],
                [150 + half_chest, bust_y],
                [150 + half_shoulder, shoulder_y],
                [150 + neck_width / 2, neck_depth],
                [150 - neck_width / 2, neck_depth],
            ],
        }

        back_panel = {
            "id": "back-panel",
            "kind": "back",
            "polyline": [
                [150 - half_shoulder, shoulder_y],
                [150 - half_chest + 2, bust_y - 2],
                [150 - half_waist + 1, waist_y],
                [150 - half_hem, length],
                [150 + half_hem, length],
                [150 + half_waist - 1, waist_y],
                [150 + half_chest - 2, bust_y - 2],
                [150 + half_shoulder, shoulder_y],
                [150 + neck_width / 2, max(4.0, neck_depth * 0.42)],
                [150 - neck_width / 2, max(4.0, neck_depth * 0.42)],
            ],
        }

        panels: list[dict[str, Any]] = [front_panel, back_panel]

        if family != "tank":
            sleeve_profile = [
                [0.0, 0.0],
                [sleeve_length * 0.28, 4.0],
                [sleeve_length, sleeve_opening],
                [sleeve_length * 0.82, sleeve_opening + 10.0],
                [sleeve_length * 0.24, 14.0],
            ]
            panels.extend(
                [
                    {
                        "id": "sleeve-left",
                        "kind": "sleeve-left",
                        "polyline": sleeve_profile,
                    },
                    {
                        "id": "sleeve-right",
                        "kind": "sleeve-right",
                        "polyline": sleeve_profile,
                        "mirroredFrom": "sleeve-left",
                    },
                ]
            )

        panels.append(
            {
                "id": "neckband",
                "kind": "neckband",
                "polyline": [
                    [0.0, 0.0],
                    [neck_width + 6.0, 0.0],
                    [neck_width + 6.0, 4.5],
                    [0.0, 4.5],
                ],
            }
        )

        return panels

    def _build_artwork_zones(self, spec: dict[str, Any]) -> list[dict[str, Any]]:
        front_artwork = spec.get("frontArtwork")
        back_artwork = spec.get("backArtwork")
        zones: list[dict[str, Any]] = []

        if front_artwork:
            zones.append(
                {
                    "side": "front",
                    "anchor": "full-front",
                    "normalizedBounds": [0.23, 0.16, 0.54, 0.54],
                    "artworkPath": front_artwork.get("pathData"),
                    "artworkColor": front_artwork.get("primaryColor"),
                }
            )

        if back_artwork:
            zones.append(
                {
                    "side": "back",
                    "anchor": "upper-back",
                    "normalizedBounds": [0.24, 0.12, 0.52, 0.38],
                    "artworkPath": back_artwork.get("pathData"),
                    "artworkColor": back_artwork.get("primaryColor"),
                }
            )

        return zones

    def _construction_notes(self, spec: dict[str, Any], family: str) -> list[str]:
        notes = [
            f"Procedural family selected: {family}.",
            "Generate shirt mesh directly from panel polylines instead of selecting a base template.",
            "Fit the resulting shirt mesh on top of the mannequin asset using the same pose and scale.",
            "Project front/back artwork after UV mapping the generated garment mesh.",
        ]

        notes.extend(spec.get("_constructionHints", []))

        if spec.get("neckline") == "v-neck":
            notes.append("Bias edge flow toward the neckline apex so the V reads cleanly in the final mesh.")
        if spec.get("sleeveLength") == "long":
            notes.append("Extend sleeve geometry to wrist length and taper the opening for a fitted forearm.")

        return notes
