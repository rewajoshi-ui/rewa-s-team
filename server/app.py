from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.environment import OAREEnvironment
from models import Action

app = FastAPI()

# ✅ CORS FIX
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize environment
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


@app.post("/run-inference")
async def run_inference():
    def get_action(phase: str):
        mapping = {"start": "search", "search": "select", "select": "init", "init": "confirm"}
        return mapping.get(phase, "noop")

    results = {}
    for t in ["easy", "medium", "hard"]:
        obs = env.reset()
        score = 0.0
        for _ in range(8):
            cmd = get_action(obs.phase)
            obs = env.step(Action(command=cmd))
            score += obs.reward_signal
            if obs.is_terminal:
                break
        results[t] = round(score, 1)
    return results