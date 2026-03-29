# Fashion Designer Backend

LLM-powered garment preview generation using OpenRouter API.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure API key:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenRouter API key
   OPENROUTER_API_KEY=your_key_here
   ```

3. **Run the server:**
   ```bash
   python start.py
   ```

   Or with uvicorn directly:
   ```bash
   uvicorn main:app --reload
   ```

4. **Access the API:**
   - API docs: http://localhost:8000/docs
   - Health check: http://localhost:8000/api/health
   - Generate endpoint: POST http://localhost:8000/api/generate

## Architecture

### Pipeline Stages

| Stage | Agent | Purpose |
|-------|-------|---------|
| 1 | `ValidatorAgent` | Validates spec completeness and coherence |
| 2 | `SpecAgent` | Enhances spec with LLM-derived refinements |
| 3 | `PreviewAgent` | Generates structured preview scene spec |

### Agents

Each agent extends `BaseAgent` which provides:
- OpenRouter API client
- Structured JSON response parsing
- Error handling with fallbacks

### API Contract

**Request:**
```json
POST /api/generate
{
  "spec": {
    "id": "shirt-123",
    "baseColor": "#f5f5f5",
    "fit": "regular",
    "sleeveLength": "short",
    "neckline": "crew",
    "hemLength": "regular",
    "frontArtwork": { "pathData": "...", "primaryColor": "#000", "visible": true },
    "backArtwork": null,
    "updatedAt": 1234567890
  }
}
```

**Response (streaming SSE):**
```json
{
  "status": "validate|process|prepare|complete|error",
  "progress": 0-100,
  "message": "Human-readable status",
  "result": { ... final spec and preview scene ... },
  "error": "Error message if failed"
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | (required) | OpenRouter API key |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `8000` | Server port |
| `FRONTEND_URL` | `http://localhost:8081` | CORS allowed origin |
| `DEFAULT_MODEL` | `qwen/qwen3-coder:free` | LLM model to use |

## Testing

```bash
# Health check
curl http://localhost:8000/api/health

# Generate preview
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"spec": {...}}'
```
