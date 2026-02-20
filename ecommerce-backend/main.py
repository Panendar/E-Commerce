import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ----------------- FastAPI App Setup -----------------
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.cart import router as cart_router
from routes.orders import router as orders_router

app = FastAPI()

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://react-deploy-d9306.web.app,http://localhost:3000"
    ).split(",")
    if origin.strip()
]

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(products_router)
app.include_router(cart_router)
app.include_router(orders_router)

# Health check
@app.get("/")
def root():
    return {"message": "Backend is running"}

# Optional: quick health endpoint for Cloud Run
@app.get("/health")
def health_check():
    return {"status": "ok"}