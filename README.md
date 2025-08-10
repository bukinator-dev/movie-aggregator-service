# Movie Aggregator Service

A service that aggregates interviews with actors and brand-related products for a given movie.

## Project Goals

**Step 1**: Basic API structure and movie search
**Step 2**: Actor interview aggregation
**Step 3**: Brand/product aggregation
**Step 4**: Data integration and response formatting
**Step 5**: Caching and optimization

## Current Status: Step 1 - Basic Setup

We're starting with a simple FastAPI service that can:
- Accept movie search requests
- Return basic movie information
- Set up the foundation for future features

## Running the Service

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

## API Endpoints

- `GET /health` - Service health check
- `GET /movie/{movie_title}` - Search for movie information (basic)

