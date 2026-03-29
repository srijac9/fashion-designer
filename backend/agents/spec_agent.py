"""
Spec Agent - Stage 2 of the pipeline.

Enhances the garment spec with LLM-derived refinements:
- Color harmony suggestions
- Fit adjustments based on design style
- Artwork placement optimization hints
"""

import json
from agents.base import BaseAgent, AgentError


class SpecAgent(BaseAgent):
    """
    Enhances garment spec with intelligent refinements.

    This agent adds value by:
    - Suggesting color adjustments for harmony
    - Recommending fit tweaks based on design elements
    - Adding metadata about design style
    """

    name = "spec"
    system_prompt = """
You are a fashion design assistant. Your job is to enhance a garment spec with intelligent refinements.

Respond with a JSON object containing ONLY these fields:
{
    "enhancements": {
        "baseColorAdjusted": "#hexcolor or null",
        "fitRecommendation": "slim|regular|relaxed or null",
        "familyHint": "tank|tee|long-sleeve or null",
        "styleTags": ["tag1", "tag2"],
        "designNotes": "brief description",
        "constructionHints": ["short implementation hints for a procedural shirt builder"]
    },
    "reasoning": "brief explanation of changes"
}

Only suggest changes if they genuinely improve the design.
"""

    async def process(self, spec: dict) -> dict:
        """
        Enhance the spec with LLM-derived refinements.
        """
        spec_json = json.dumps(spec, indent=2)

        user_prompt = f"""
Enhance this shirt garment spec:

{spec_json}

Consider:
1. Color harmony - does the base color work with the artwork?
2. Style coherence - do the attributes match the design intent?
3. Fit recommendations - any adjustments for this style?
4. Procedural build hints - which shirt family should a geometry builder lean toward?

Return JSON with enhancements and reasoning.
"""

        try:
            response = await self.call_llm(user_prompt)
            result = self._parse_json_response(response)

            # Apply enhancements to spec
            enhancements = result.get("enhancements", {})

            # Only apply if non-null
            if enhancements.get("baseColorAdjusted"):
                spec["_adjustedColor"] = enhancements["baseColorAdjusted"]

            if enhancements.get("fitRecommendation"):
                spec["_recommendedFit"] = enhancements["fitRecommendation"]

            if enhancements.get("familyHint"):
                spec["_familyHint"] = enhancements["familyHint"]

            # Add metadata
            spec["_styleTags"] = enhancements.get("styleTags", [])
            spec["_designNotes"] = enhancements.get("designNotes", "")
            spec["_constructionHints"] = enhancements.get("constructionHints", [])
            spec["_enhancementReasoning"] = result.get("reasoning", "")

            return spec

        except (json.JSONDecodeError, AgentError):
            # Pass through unchanged if LLM fails
            spec["_enhancementSkipped"] = True
            spec["_constructionHints"] = []
            return spec

    def _parse_json_response(self, response: str | None) -> dict:
        """Extract and parse JSON from LLM response."""
        if not response or not isinstance(response, str):
            raise AgentError("LLM returned no text response")
        start = response.find("{")
        end = response.rfind("}") + 1
        if start >= 0 and end > start:
            json_str = response[start:end]
            return json.loads(json_str)
        raise AgentError("LLM response did not contain JSON")
