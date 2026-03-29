"""
Pydantic schemas for API request/response.
Mirrors frontend TypeScript types for type safety.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional


# Shirt attribute types
ShirtFit = Literal["slim", "regular", "relaxed"]
ShirtSleeveLength = Literal["short", "long", "sleeveless"]
ShirtNeckline = Literal["crew", "v-neck", "polo", "henley"]
ShirtHemLength = Literal["regular", "extended", "cropped"]


class ShirtArtwork(BaseModel):
    """Artwork/drawing on the shirt."""

    pathData: str = Field(..., description="SVG path data from user drawing")
    primaryColor: str = Field(..., description="Primary color used in artwork")
    visible: bool = Field(..., description="Whether artwork is visible")


class ShirtGarmentSpec(BaseModel):
    """
    Shirt garment spec - the single source of truth.
    This is the contract between frontend and backend.
    """

    id: str = Field(..., description="Unique identifier for this shirt design")
    baseColor: str = Field(..., description="Base color of the shirt fabric")
    fit: ShirtFit = Field(..., description="Fit silhouette")
    sleeveLength: ShirtSleeveLength = Field(..., description="Sleeve length")
    neckline: ShirtNeckline = Field(..., description="Neckline style")
    hemLength: ShirtHemLength = Field(..., description="Hem length")
    frontArtwork: Optional[ShirtArtwork] = Field(None, description="Front artwork")
    backArtwork: Optional[ShirtArtwork] = Field(None, description="Back artwork")
    updatedAt: int = Field(..., description="Timestamp of last update")


class PipelineStageStatus(BaseModel):
    """Status of a single pipeline stage."""

    stage: str
    status: Literal["pending", "running", "complete", "error"]
    message: str
    progress: int = 0  # 0-100


class PipelineResponse(BaseModel):
    """
    Response from the pipeline.
    Used for both streaming updates and final result.
    """

    status: Literal["validate", "process", "prepare", "complete", "error"]
    progress: int  # 0-100
    message: str
    result: Optional[dict] = None
    error: Optional[str] = None


class ModelAssetRef(BaseModel):
    """Reference to the 3D garment/mannequin asset the viewer should load."""

    assetId: str
    format: Literal["glb", "gltf"]
    source: Literal["local-bundle", "remote-url", "unconfigured"]
    uri: str
    configured: bool = False


class ModelMaterialBindings(BaseModel):
    """Material overrides that should be applied to the 3D model."""

    fabricBaseColor: str
    trimColor: str
    frontArtworkColor: Optional[str]
    backArtworkColor: Optional[str]


class ModelArtworkBindings(BaseModel):
    """Front/back artwork bindings for texture or decal application."""

    frontArtworkPath: Optional[str]
    backArtworkPath: Optional[str]
    mappingMode: Literal["decal", "texture-overlay"]
    frontArtworkVisible: bool
    backArtworkVisible: bool


class ModelSilhouetteBindings(BaseModel):
    """Preset or morph-target bindings for the true 3D shirt model."""

    fitPreset: ShirtFit
    sleevePreset: ShirtSleeveLength
    necklinePreset: ShirtNeckline
    hemPreset: ShirtHemLength


class CameraPreset(BaseModel):
    """Camera positions the viewer can offer on the generated model screen."""

    id: str
    label: str
    yaw: float
    pitch: float
    distance: float


class BlueprintMeasurements(BaseModel):
    """Deterministic measurements derived from the interpreted shirt spec."""

    shoulderWidth: float
    chestWidth: float
    waistWidth: float
    hemWidth: float
    bodyLength: float
    armholeDepth: float
    sleeveLength: float
    sleeveOpeningWidth: float
    necklineWidth: float
    necklineDepth: float


class BlueprintPanel(BaseModel):
    """2D construction profile for a garment panel before mesh generation."""

    id: str
    kind: Literal["front", "back", "sleeve-left", "sleeve-right", "neckband"]
    polyline: list[list[float]]
    mirroredFrom: Optional[str] = None


class ArtworkZone(BaseModel):
    """Artwork placement area to project onto the generated shirt mesh."""

    side: Literal["front", "back"]
    anchor: Literal["upper-chest", "full-front", "upper-back", "full-back"]
    normalizedBounds: list[float]
    artworkPath: Optional[str]
    artworkColor: Optional[str]


class GarmentBlueprint(BaseModel):
    """Procedural garment blueprint used by the shirt mesh builder."""

    blueprintId: str
    generationMode: Literal["procedural-shirt-builder"]
    family: Literal["tank", "tee", "long-sleeve"]
    measurements: BlueprintMeasurements
    panels: list[BlueprintPanel]
    artworkZones: list[ArtworkZone]
    constructionNotes: list[str]
    styleTags: list[str]


class GeneratedGarmentAsset(BaseModel):
    """Manifest for the generated shirt asset that will sit on the mannequin."""

    assetId: str
    format: Literal["glb"]
    exportStatus: Literal["blueprint-generated", "glb-export-pending", "glb-generated"]
    outputPath: str
    outputUri: str
    manifestPath: str
    manifestUri: str
    mannequinAssetUri: str
    layeringMode: Literal["shirt-over-mannequin"]
    vertexCount: int
    triangleCount: int
    fileSizeBytes: int


class ModelRenderConfig(BaseModel):
    """
    Structured configuration for the real 3D model viewer.
    This replaces the SVG preview-scene contract.
    """

    modelAsset: ModelAssetRef
    garmentBlueprint: GarmentBlueprint
    generatedShirtAsset: GeneratedGarmentAsset
    materialBindings: ModelMaterialBindings
    artworkBindings: ModelArtworkBindings
    silhouetteBindings: ModelSilhouetteBindings
    cameraPresets: list[CameraPreset]
    activeCameraId: str
    viewerMode: Literal["true-3d-model"]
    renderNotes: str
    integrationStatus: Literal[
        "awaiting-asset",
        "mannequin-ready",
        "procedural-builder-ready",
        "ready-for-viewer",
    ]


class GenerateRequest(BaseModel):
    """Request to generate preview."""

    spec: ShirtGarmentSpec
