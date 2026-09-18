from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.resume_routes import router as resume_router
from app.api.ats_routes import router as ats_router
from app.api.role_routes import router as role_router
from app.api.optimizer_routes import router as optimizer_router
from app.config import settings

app = FastAPI(
    title="AI ATS Resume Optimizer Engine",
    description="Python FastAPI engine for document parsing, deterministic ATS scoring, role matching, and anti-fabrication resume optimization.",
    version="2.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(resume_router)
app.include_router(ats_router)
app.include_router(role_router)
app.include_router(optimizer_router)

@app.get("/api/ai/health")
async def health_check():
    return {
        "status": "online",
        "service": "AI ATS Resume Optimization Service",
        "version": "2.0.0",
        "engine": "Deterministic + NLP Anti-Fabrication Engine"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
