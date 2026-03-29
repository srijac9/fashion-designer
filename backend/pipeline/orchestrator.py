"""
Pipeline orchestrator - coordinates the multi-stage garment generation pipeline.

Flow:
1. ValidatorAgent - validates spec completeness
2. SpecAgent - enhances spec with LLM refinements
3. PreviewAgent - generates preview scene spec

Supports both streaming (async generator) and batch modes.
"""

from typing import AsyncGenerator, Optional, List
from pydantic import BaseModel

from schemas import ShirtGarmentSpec, PipelineResponse
from agents import ValidatorAgent, SpecAgent, PreviewAgent


class PipelineStage(BaseModel):
    """Represents a single stage in the pipeline."""

    name: str
    agent: type
    progress_start: int
    progress_end: int


# Define pipeline stages
STAGES: List[PipelineStage] = [
    PipelineStage(
        name="validate",
        agent=ValidatorAgent,
        progress_start=0,
        progress_end=30,
    ),
    PipelineStage(
        name="process",
        agent=SpecAgent,
        progress_start=30,
        progress_end=70,
    ),
    PipelineStage(
        name="prepare",
        agent=PreviewAgent,
        progress_start=70,
        progress_end=100,
    ),
]


async def run_pipeline(
    spec: ShirtGarmentSpec,
    stream: bool = False,
) -> PipelineResponse | AsyncGenerator[PipelineResponse, None]:
    """
    Run the garment generation pipeline.

    Args:
        spec: Input garment spec from frontend
        stream: If True, yield progress updates. If False, return final result.

    Returns:
        PipelineResponse with final result, or async generator of progress updates.
    """
    # Convert pydantic model to dict for processing
    spec_dict = spec.model_dump() if hasattr(spec, "model_dump") else dict(spec)

    if stream:
        return _run_pipeline_stream(spec_dict)
    else:
        return await _run_pipeline_batch(spec_dict)


async def _run_pipeline_stream(
    spec_dict: dict,
) -> AsyncGenerator[PipelineResponse, None]:
    """Run pipeline with streaming progress updates."""

    for stage in STAGES:
        # Emit stage start
        yield PipelineResponse(
            status=stage.name,
            progress=stage.progress_start,
            message=f"Starting {stage.name}...",
        )

        try:
            agent = stage.agent()
            spec_dict = await agent.process(spec_dict)

            # Emit stage complete
            yield PipelineResponse(
                status=stage.name,
                progress=stage.progress_end,
                message=f"Completed {stage.name}",
            )

        except Exception as e:
            yield PipelineResponse(
                status="error",
                progress=0,
                message=f"Failed at {stage.name}",
                error=str(e),
            )
            return

    # Build final result
    model_render_config = spec_dict.get("_modelRenderConfig", {})
    result = {
        "spec": spec_dict,
        "modelRenderConfig": model_render_config,
    }

    yield PipelineResponse(
        status="complete",
        progress=100,
        message="Procedural shirt blueprint ready",
        result=result,
    )


async def _run_pipeline_batch(spec_dict: dict) -> PipelineResponse:
    """Run pipeline and return final result only."""

    for stage in STAGES:
        try:
            agent = stage.agent()
            spec_dict = await agent.process(spec_dict)
        except Exception as e:
            return PipelineResponse(
                status="error",
                progress=0,
                message=f"Failed at {stage.name}",
                error=str(e),
            )

    # Build final result
    model_render_config = spec_dict.get("_modelRenderConfig", {})
    result = {
        "spec": spec_dict,
        "modelRenderConfig": model_render_config,
    }

    return PipelineResponse(
        status="complete",
        progress=100,
        message="Procedural shirt blueprint ready",
        result=result,
    )
