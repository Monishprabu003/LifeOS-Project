from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, health, wealth, relationship, tasks, purpose, insights, review, dashboard
from app.database import engine, Base

app = FastAPI(title="LifeOS API", version="1.0.0")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

app.include_router(auth.router)
app.include_router(health.router)
app.include_router(wealth.router)
app.include_router(relationship.router)
app.include_router(tasks.router)
app.include_router(purpose.router)
app.include_router(insights.router)
app.include_router(review.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to LifeOS API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
