"""
Validator Agent - Stage 1 of the pipeline.

Validates that the garment spec is coherent and complete.
Catches issues before they propagate through the pipeline.
"""

import json
from agents.base import BaseAgent, AgentError


class ValidatorAgent(BaseAgent):
    """
    Validates garment spec for completeness and coherence.

    Checks:
    - Required fields are present
    - Attribute values are valid
    - Artwork (if present) has valid path data
    - Design is physically reasonable
    """

    name = "validator"
    system_prompt = """
You are a garment design validator. Your job is to check if a shirt design spec is valid and complete.

Respond with a JSON object in this exact format:
{
    "valid": true/false,
    "errors": ["list of error messages if any"],
    "warnings": ["list of warning messages if any"],
    "suggestions": ["optional improvement suggestions"]
}

Be strict but fair. A design should pass if it's fundamentally sound.
"""

    async def process(self, spec: dict) -> dict:
        """
        Validate the spec and return result with validation metadata.
        """
        # Build prompt with spec details
        spec_json = json.dumps(spec, indent=2)

        user_prompt = f"""
Validate this shirt garment spec:

{spec_json}

Check:
1. All required fields present (id, baseColor, fit, sleeveLength, neckline, hemLength)
2. Attribute values are valid options
3. If artwork exists, pathData is non-empty
4. Design is coherent (no contradictory choices)

Return JSON with: valid, errors, warnings, suggestions
"""

        try:
            response = await self.call_llm(user_prompt)
            # Parse JSON from response
            result = self._parse_json_response(response)

            # Add validation result to spec
            spec["_validation"] = result
            spec["_valid"] = result.get("valid", False)

            if not result.get("valid", False):
                errors = result.get("errors", [])
                if errors:
                    raise AgentError(f"Validation failed: {'; '.join(errors)}")

            return spec

        except (json.JSONDecodeError, AgentError):
            # Fallback: basic Python validation if LLM fails or is rate-limited
            return self._fallback_validation(spec)

    def _parse_json_response(self, response: str | None) -> dict:
        """Extract and parse JSON from LLM response."""
        if not response or not isinstance(response, str):
            raise AgentError("LLM returned no text response")
        # Try to find JSON in response
        start = response.find("{")
        end = response.rfind("}") + 1
        if start >= 0 and end > start:
            json_str = response[start:end]
            return json.loads(json_str)
        raise AgentError("LLM response did not contain JSON")

    def _fallback_validation(self, spec: dict) -> dict:
        """Basic validation without LLM."""
        errors = []
        warnings = []

        # Required fields
        required = ["id", "baseColor", "fit", "sleeveLength", "neckline", "hemLength"]
        for field in required:
            if field not in spec:
                errors.append(f"Missing required field: {field}")

        # Valid values
        valid_fits = ["slim", "regular", "relaxed"]
        valid_sleeves = ["short", "long", "sleeveless"]
        valid_necks = ["crew", "v-neck", "polo", "henley"]
        valid_hems = ["regular", "extended", "cropped"]

        if spec.get("fit") not in valid_fits:
            errors.append(f"Invalid fit: {spec.get('fit')}")
        if spec.get("sleeveLength") not in valid_sleeves:
            errors.append(f"Invalid sleeveLength: {spec.get('sleeveLength')}")
        if spec.get("neckline") not in valid_necks:
            errors.append(f"Invalid neckline: {spec.get('neckline')}")
        if spec.get("hemLength") not in valid_hems:
            errors.append(f"Invalid hemLength: {spec.get('hemLength')}")

        # Artwork validation
        for side in ["frontArtwork", "backArtwork"]:
            artwork = spec.get(side)
            if artwork:
                if not artwork.get("pathData"):
                    warnings.append(f"{side} has empty pathData")
                if not artwork.get("primaryColor"):
                    warnings.append(f"{side} missing primaryColor")

        validation_result = {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "suggestions": [],
        }

        spec["_validation"] = validation_result
        spec["_valid"] = validation_result["valid"]

        if not validation_result["valid"] and validation_result["errors"]:
            raise AgentError(f"Validation failed: {'; '.join(validation_result['errors'])}")

        spec["_validationFallbackUsed"] = True
        return spec
