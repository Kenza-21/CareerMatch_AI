# Career Match AI

Career Match AI is an AI-powered career management platform tailored for the Moroccan job market.
It helps job seekers analyze, optimize, and match their CVs with job offers, while receiving personalized career coaching powered by modern NLP and Generative AI.

---

## Key Features

- Job matching engine using TF-IDF and cosine similarity
- AI career coach powered by Google Gemini
- CV analyzer with skill gap detection
- ATS-friendly CV optimization and evaluation
- Step-by-step CV builder with DOCX and PDF export

---

## AI & NLP Techniques Used

- TF-IDF vectorization
- Cosine similarity
- Semantic text normalization
- Transformer-based embeddings
- Generative AI (Google Gemini)
- Automated CV parsing (ResumeParser API)

---

## Project Architecture

```
ai_career_match/
├── backend/      # FastAPI backend
└── frontend/     # React + TypeScript frontend
```

Data flow:

```
React Frontend
   → FastAPI Backend
   → AI / NLP Services & External APIs
   → Response to Client
```

---

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- scikit-learn
- spaCy
- NLTK
- sentence-transformers
- Google Gemini API
- ResumeParser API

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- shadcn/ui

---

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- pip
- npm or yarn

---

## Required API Keys

| Service         |        Usage                |
|--------------- -|-----------------------------|
| API             | AI coach and ATS evaluation |
| ResumeParser API| CV parsing                  |

Obtain keys from:
- https://makersuite.google.com/app/apikey
- https://resumeparser.app

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai_career_match
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

```bash
# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
pip install -r backend/req2.txt
python -m spacy download en_core_web_sm
```

---

### 3. Backend Configuration

Option 1: Create a `.env` file inside the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
RESUMEPARSER_API_KEY=your_resumeparser_key
HOST=0.0.0.0
PORT=8000
```

Do not commit API keys to version control.

---
Option 2 : You can just use our api_keys

### 4. Start Backend

```bash
uvicorn main:app --reload
```

Backend URLs:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs

---

### 5. Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend URL:
http://localhost:8080

---

## Verify Installation

- Backend Swagger UI loads correctly
- Frontend application starts successfully
- API requests succeed
- CV upload and analysis works

---

## Folder Structure

### Backend

```
backend/
├── routes/
├── services/
├── models/
├── utils/
├── data/
└── main.py
```

### Frontend

```
frontend/
├── components/
├── pages/
├── services/
├── lib/
├── App.tsx
└── main.tsx
```

---

## API Overview

| Endpoint             | Description          |
|----------------------|----------------------|
| /api/assistant       | Job search assistant |
| /api/smart-assistant | AI career coach      |
| /cv/analyze          | CV vs job analysis   |
| /api/ats_cv          | ATS CV optimization  |
| /api/ats_evaluate    | ATS evaluation       |
| /resume/generate-cv  | CV builder           |

Full API documentation is available at `/docs`.

---

## Common Issues

Backend does not start:
- Check virtual environment activation
- Verify `.env` configuration
- Ensure port 8000 is available

Frontend cannot connect to backend:
- Confirm backend is running
- Verify `VITE_API_URL`
- Check CORS configuration

---

## License

Educational and professional use.

## Support

For issues or questions, open a GitHub issue or consult the API documentation.
