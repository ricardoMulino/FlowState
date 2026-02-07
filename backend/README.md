# ChronoHeight Backend

FastAPI backend for ChronoHeight Calendar.

## Setup

1.  Create virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\Activate
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Configure environment:
    Copy `.env.example` to `.env` and update if necessary.

4.  Run server:
    ```bash
    uvicorn app.main:app --reload
    ```

## API Documentation

Once running, visit `http://localhost:8000/docs` for Swagger UI.
