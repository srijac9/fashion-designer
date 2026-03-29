"""
Base agent class for all pipeline agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Optional
import httpx
from config import settings


class AgentError(Exception):
    """Error during agent processing."""

    pass


class BaseAgent(ABC):
    """
    Base class for all agents in the pipeline.

    Each agent:
    - Receives a spec (dict or model)
    - Makes an LLM call via OpenRouter
    - Returns an enhanced/transformed spec
    """

    name: str = "base"
    system_prompt: str = "You are a helpful assistant."

    def __init__(self, model: Optional[str] = None):
        self.model = model or settings.DEFAULT_MODEL

    async def call_llm(self, user_prompt: str) -> str:
        """
        Call OpenRouter API with the given prompt.
        Returns the raw response text.
        """
        if not settings.OPENROUTER_API_KEY:
            raise AgentError(
                "OPENROUTER_API_KEY not configured. Cannot make LLM call."
            )

        headers = {
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Fashion Designer MVP",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.3,
            "max_tokens": 1000,
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{settings.OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                normalized = self._normalize_content(content)
                if not normalized:
                    raise AgentError("OpenRouter returned an empty response body")
                return normalized
            except httpx.HTTPError as e:
                raise AgentError(f"OpenRouter API call failed: {e}")
            except (KeyError, IndexError, TypeError) as e:
                raise AgentError(f"Invalid response from OpenRouter: {e}")

    def _normalize_content(self, content: Any) -> str:
        """Normalize provider content into a plain string."""
        if isinstance(content, str):
            return content.strip()

        if isinstance(content, list):
            text_parts: list[str] = []
            for item in content:
                if isinstance(item, str):
                    text_parts.append(item)
                    continue

                if isinstance(item, dict):
                    if isinstance(item.get("text"), str):
                        text_parts.append(item["text"])
                        continue
                    if item.get("type") == "text" and isinstance(item.get("content"), str):
                        text_parts.append(item["content"])

            return "\n".join(part.strip() for part in text_parts if part and part.strip())

        return ""

    @abstractmethod
    async def process(self, spec: dict) -> dict:
        """
        Process the spec and return enhanced/transformed result.
        Must be implemented by each agent.
        """
        pass
