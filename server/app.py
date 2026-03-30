from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.environment import OAREEnvironment

app = FastAPI()

# ✅ CORS FIX (VERY IMPORTANT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize environment
env = OAREEnvironment()


@app.get("/")
def root():
    return {"message": "OARE backend running 🚀"}


@app.get("/state")
def get_state():
    return env.state


@app.post("/reset")
def reset():
    return env.reset()