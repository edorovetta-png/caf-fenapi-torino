from fastapi import FastAPI

app = FastAPI(title="Antigravity Backend")

@app.get("/")
async def root():
    return {"message": "Welcome to Antigravity FastAPI backend."}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
