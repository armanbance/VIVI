# FastAPI Backend

A simple backend API built with FastAPI and Python 3.11.

## Setup

1. Create a virtual environment:

```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
python main.py
```

Or alternatively:

```bash
uvicorn main:app --reload
```

4. Access the API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `GET /`: Welcome message
- `GET /api/health`: Health check endpoint
- `GET /api/items`: Get all items
- `GET /api/items/{item_id}`: Get a specific item
- `POST /api/items`: Create a new item
