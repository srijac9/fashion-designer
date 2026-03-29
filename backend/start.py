#!/usr/bin/env python3
"""
Startup script for the backend server.
Run with: python start.py
Or: uvicorn main:app --reload
"""

import uvicorn
from config import settings

if __name__ == "__main__":
    print(f"Starting Fashion Designer Backend...")
    print(f"  API Key configured: {'Yes' if settings.OPENROUTER_API_KEY else 'No (WARNING: LLM calls will fail)'}")
    print(f"  Server: http://{settings.HOST}:{settings.PORT}")
    print(f"  Frontend CORS: {settings.FRONTEND_URL}")
    print()

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
