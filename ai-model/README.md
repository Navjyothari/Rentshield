# RentShield AI Analysis Engine

AI-powered microservice for tenant dispute resolution, providing evidence verification, issue classification, and DAO recommendation generation.

## 🎯 Overview

RentShield AI Analysis Engine is a stateless FastAPI microservice that analyzes housing disputes using a local LLM (Ollama + Mistral). It receives dispute data, processes it through AI analysis, and returns structured JSON verdicts.

### Key Features

- **Issue Classification**: Categorize tenant issues (Safety, Maintenance, Harassment, Discrimination)
- **Evidence Validation**: EXIF extraction, tampering detection, authenticity scoring
- **DAO Recommendations**: Comprehensive dispute analysis for decentralized arbitration
- **Batch Processing**: Classify multiple issues in a single request

## 📋 Prerequisites

1. **Python 3.11+**
2. **Ollama** with Mistral 7B model
   ```bash
   # Install Ollama (https://ollama.ai)
   # Then pull the Mistral model:
   ollama pull mistral
   ```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tenant-dispute-ai-engine
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional - defaults work for local dev)
```

### 5. Start Ollama (in a separate terminal)

```bash
ollama serve
```

### 6. Run the Service

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now running at `http://localhost:8000`

## 📖 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check and LLM status |
| `/api/v1/classify-issue` | POST | Classify a tenant issue |
| `/api/v1/validate-evidence` | POST | Validate image evidence |
| `/api/v1/analyze-case` | POST | Full dispute analysis |
| `/api/v1/batch-classify` | POST | Batch issue classification |

### Example Requests

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Classify Issue
```bash
curl -X POST http://localhost:8000/api/v1/classify-issue \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Water has been leaking from the ceiling for 2 weeks causing mold growth",
    "evidence_count": 3
  }'
```

#### Validate Evidence
```bash
curl -X POST http://localhost:8000/api/v1/validate-evidence \
  -F "image=@/path/to/evidence.jpg" \
  -F "claim_text=Water damage in kitchen ceiling"
```

#### Analyze Case
```bash
curl -X POST http://localhost:8000/api/v1/analyze-case \
  -H "Content-Type: application/json" \
  -d '{
    "issue_id": "case-123",
    "tenant_complaint": "Heating has been broken for 3 weeks...",
    "landlord_response": "We scheduled repairs twice...",
    "incident_date": "2024-01-10T00:00:00Z",
    "tenant_evidence": [],
    "landlord_evidence": []
  }'
```

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `mistral` | LLM model name |
| `OLLAMA_TIMEOUT` | `120` | Request timeout (seconds) |
| `MAX_FILE_SIZE` | `10485760` | Max upload size (10MB) |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |
| `LOG_LEVEL` | `INFO` | Logging level |

## 🧪 Testing

### Run All Tests
```bash
pytest tests/ -v
```

### Run with Coverage
```bash
pytest tests/ -v --cov=app --cov-report=html
```

### Run Demo Script
```bash
python test_demo.py
```

## 🐳 Docker Deployment (Optional)

### Using Docker Compose

```bash
# Start Ollama and the API service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔌 Integration Points

This AI engine is designed to be called by:

1. **Supabase Edge Functions** (when tenant submits issue)
   - `POST /api/v1/classify-issue`
   - `POST /api/v1/validate-evidence`

2. **React Frontend** (real-time analysis preview)
   - `POST /api/v1/classify-issue`

3. **DAO Panel** (when case goes to arbitration)
   - `POST /api/v1/analyze-case`

4. **Cron Job / Scheduler** (batch processing)
   - `POST /api/v1/batch-classify`

## 🔧 Troubleshooting

### Ollama Connection Failed

```
LLM connection failed - service will run in degraded mode
```

**Solution**: Ensure Ollama is running:
```bash
ollama serve
ollama pull mistral
```

### LLM Timeout Errors

**Solution**: Increase timeout in `.env`:
```
OLLAMA_TIMEOUT=180
```

### CORS Errors

**Solution**: Add your frontend URL to CORS origins:
```
CORS_ORIGINS=http://localhost:5173,http://your-frontend-url.com
```

### Image Upload Failed

**Solution**: Check file size (max 10MB) and format (JPG/PNG only).

## 📁 Project Structure

```
tenant-dispute-ai-engine/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app
│   ├── config.py                  # Settings
│   ├── models/
│   │   ├── requests.py            # Request models
│   │   └── responses.py           # Response models
│   ├── services/
│   │   ├── llm_service.py         # Ollama integration
│   │   ├── evidence_validator.py  # EXIF analysis
│   │   └── case_analyzer.py       # Issue classification
│   ├── api/
│   │   └── endpoints.py           # API routes
│   └── utils/
│       ├── logger.py              # Structured logging
│       └── exceptions.py          # Custom exceptions
├── tests/
├── requirements.txt
├── .env.example
└── docker-compose.yml
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
