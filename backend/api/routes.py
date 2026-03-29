"""
API routes for garment generation.
"""

import asyncio
from typing import AsyncGenerator
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import json

from schemas import ShirtGarmentSpec, PipelineResponse, GenerateRequest
from pipeline.orchestrator import run_pipeline

router = APIRouter()


@router.post("/generate")
async def generate_preview(request: GenerateRequest) -> PipelineResponse:
    """
    Generate a preview from garment spec.
    Returns final result (use /generate/stream for progress updates).
    """
    try:
        result = await run_pipeline(request.spec)
        if isinstance(result, PipelineResponse):
            return result

        return PipelineResponse(
            status="error",
            progress=0,
            message="Generation failed",
            error="Pipeline returned an unexpected response type",
        )
    except Exception as e:
        return PipelineResponse(
            status="error",
            progress=0,
            message="Generation failed",
            error=str(e),
        )


@router.post("/generate/stream")
async def generate_preview_stream(request: GenerateRequest) -> StreamingResponse:
    """
    Generate preview with streaming progress updates.
    Returns SSE-style stream of pipeline stages.
    """

    async def stream_generator() -> AsyncGenerator[str, None]:
        """Yield pipeline progress as SSE events."""
        try:
            pipeline_stream = await run_pipeline(request.spec, stream=True)
            async for update in pipeline_stream:
                # Format as SSE event
                data = {
                    "status": update.status,
                    "progress": update.progress,
                    "message": update.message,
                    "result": update.result.model_dump()
                    if update.result and hasattr(update.result, "model_dump")
                    else update.result,
                    "error": update.error,
                }
                yield f"data: {json.dumps(data)}\n\n"
        except Exception as e:
            error_data = {
                "status": "error",
                "progress": 0,
                "message": "Generation failed",
                "error": str(e),
            }
            yield f"data: {json.dumps(error_data)}\n\n"

    return StreamingResponse(
        stream_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
