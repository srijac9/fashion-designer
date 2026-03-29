"""
Model Config Agent - Stage 3 of the pipeline.

Builds a structured configuration for a true 3D shirt/mannequin model viewer.
This stage now calls a procedural shirt builder so the pipeline produces a
garment blueprint and generated-shirt asset manifest instead of selecting from
prebaked shirt templates.
"""

from __future__ import annotations

from builder import ParametricShirtBuilder


class PreviewAgent:
    """
    Produces model-render bindings for the generated model screen.

    The output is a deterministic configuration object describing:
    - which 3D asset to load
    - which silhouette presets to apply
    - which material colors to override
    - which artwork paths to project as decals/textures
    - which camera presets the generated screen should expose
    """

    name = "model-config"

    def __init__(self) -> None:
        self.builder = ParametricShirtBuilder()

    async def process(self, spec: dict) -> dict:
        """Attach model render config to the garment spec."""
        procedural_build = self.builder.build(spec)
        spec["_garmentBlueprint"] = procedural_build["garmentBlueprint"]
        spec["_generatedShirtAsset"] = procedural_build["generatedShirtAsset"]
        spec["_modelRenderConfig"] = self._build_model_render_config(spec, procedural_build)
        return spec

    def _build_model_render_config(self, spec: dict, procedural_build: dict) -> dict:
        base_color = spec.get("baseColor", "#ffffff")
        front_artwork = spec.get("frontArtwork")
        back_artwork = spec.get("backArtwork")

        return {
            "modelAsset": {
                "assetId": "female-mannequin-v1",
                "format": "glb",
                "source": "remote-url",
                "uri": "/assets/models/female_mannequin.glb",
                "configured": True,
            },
            "garmentBlueprint": procedural_build["garmentBlueprint"],
            "generatedShirtAsset": procedural_build["generatedShirtAsset"],
            "materialBindings": {
                "fabricBaseColor": base_color,
                "trimColor": self._derive_trim_color(base_color),
                "frontArtworkColor": front_artwork.get("primaryColor") if front_artwork else None,
                "backArtworkColor": back_artwork.get("primaryColor") if back_artwork else None,
            },
            "artworkBindings": {
                "frontArtworkPath": front_artwork.get("pathData") if front_artwork else None,
                "backArtworkPath": back_artwork.get("pathData") if back_artwork else None,
                "mappingMode": "decal",
                "frontArtworkVisible": bool(front_artwork and front_artwork.get("visible")),
                "backArtworkVisible": bool(back_artwork and back_artwork.get("visible")),
            },
            "silhouetteBindings": {
                "fitPreset": spec.get("fit", "regular"),
                "sleevePreset": spec.get("sleeveLength", "short"),
                "necklinePreset": spec.get("neckline", "crew"),
                "hemPreset": spec.get("hemLength", "regular"),
            },
            "cameraPresets": [
                {
                    "id": "hero",
                    "label": "Hero",
                    "yaw": 18,
                    "pitch": 10,
                    "distance": 2.4,
                },
                {
                    "id": "front",
                    "label": "Front",
                    "yaw": 0,
                    "pitch": 0,
                    "distance": 2.1,
                },
                {
                    "id": "back",
                    "label": "Back",
                    "yaw": 180,
                    "pitch": 0,
                    "distance": 2.1,
                },
            ],
            "activeCameraId": "hero",
            "viewerMode": "true-3d-model",
            "renderNotes": (
                "Procedural shirt GLB generated successfully. The viewer can now load the "
                "generated shirt asset and mannequin over HTTP, then apply the material and "
                "artwork bindings at runtime."
            ),
            "integrationStatus": "ready-for-viewer",
        }

    def _derive_trim_color(self, base_color: str) -> str:
        """Create a slightly darker trim color from a hex base color."""
        normalized = base_color.lstrip("#")
        if len(normalized) != 6:
            return "#B0B0B0"

        channels = [normalized[i : i + 2] for i in range(0, 6, 2)]
        darker = []
        for channel in channels:
            value = int(channel, 16)
            darker.append(f"{max(0, int(value * 0.78)):02X}")
        return f"#{''.join(darker)}"
