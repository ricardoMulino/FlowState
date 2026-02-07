from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import tasks, calendar

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="ChronoHeight Calendar API",
    lifespan=lifespan
)

# CORS
origins = settings.ALLOWED_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(tasks.router)
app.include_router(calendar.router)

@app.get("/")
async def root():
    return {"message": "Welcome to ChronoHeight Calendar API"}
