
import os
import re
import textwrap
from typing import List, Optional, Dict

from openai import OpenAI

# Try to import the environment as specified in the prompt
# If it's not present, we fall back to a compatible wrapper for OAREEnvironment
try:
    from browsergym_env import BrowserGymEnv
except ImportError:
    # If the module is missing, we adapt the local OAREEnvironment to be OpenEnv-compatible
    try:
        from server.environment import OAREEnvironment
        
        class BrowserGymEnv:
            def __init__(self):
                self.env = OAREEnvironment()
            
            def reset(self, task_name=None):
                # OARE reset doesn't take task_name, but we handle it
                obs = self.env.reset()
                return obs

            def step(self, action_str):
                # Convert string action to models.Action if needed
                from models import Action
                # Ensure we strip parentheses if the LLM/Mock added them
                cmd = action_str.replace("()", "").strip()
                obs = self.env.step(Action(command=cmd))
                # Map to standard (observation, reward, done, info)
                return obs, obs.reward_signal, obs.is_terminal, {}

            def state(self):
                return self.env.state
    except ImportError:
        # Absolute fallback if nothing is available
        class BrowserGymEnv:
            def reset(self, task_name=None): return "Init"
            def step(self, action): return ("Obs", 0.0, True, {})
            def state(self): return {}

# Configuration from Environment Variables
API_BASE_URL = os.getenv("API_BASE_URL", "https://router.huggingface.co/v1")
API_KEY = os.getenv("HF_TOKEN") or os.getenv("API_KEY") or "EMPTY_KEY"
MODEL_NAME = os.getenv("MODEL_NAME") or "gpt-dummy"
MOCK_LLM = True # Set to True for DEMO without API key
MAX_STEPS = 10
TEMPERATURE = 0.2
MAX_TOKENS = 150
FALLBACK_ACTION = "noop()"

# Action matching regex to extract valid commands from LLM noise
ACTION_PATTERN = re.compile(r"[A-Za-z_]+\s*\(.*\)", re.DOTALL)

SYSTEM_PROMPT = textwrap.dedent(
    """
    You control an automated OARE engine through specified commands.
    Reply with exactly one action string.
    The action must be a valid command such as:
    - noop()
    - search()
    - select()
    - init()
    - confirm()
    Do not include explanations or additional text.
    If you are unsure, respond with noop().
    """
).strip()

def get_action_from_llm(client: OpenAI, model: str, observation: str) -> str:
    """Fetches the next action from the LLM based on the current observation."""
    if MOCK_LLM:
        # Simple logical flow for OARE demonstration
        obs_lower = observation.lower()
        if 'start' in obs_lower: return "search"
        if 'search' in obs_lower: return "select"
        if 'select' in obs_lower: return "init"
        if 'init' in obs_lower: return "confirm"
        return FALLBACK_ACTION

    if not model or API_KEY == "EMPTY_KEY":
        return FALLBACK_ACTION
        
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Observation: {observation}\nWhat is your next action?"}
            ],
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )
        content = response.choices[0].message.content.strip()
        
        # Extract action using the specified format regex
        match = ACTION_PATTERN.search(content)
        if match:
            # Clean parentheses if they are returned by LLM
            return match.group(0).replace("()", "")
        return FALLBACK_ACTION
    except Exception:
        return FALLBACK_ACTION

def run_task(env: BrowserGymEnv, client: OpenAI, task_name: str) -> float:
    """Runs a single task and returns the total reward accumulated."""
    print(f"\n--- Starting Task: {task_name} ---")
    obs = env.reset(task_name=task_name)
    total_reward = 0.0
    
    for step_num in range(1, MAX_STEPS + 1):
        # Pass observation to LLM
        obs_str = str(obs)
        action_str = get_action_from_llm(client, MODEL_NAME, obs_str)
        
        # Execute action
        obs, reward, done, info = env.step(action_str)
        total_reward += reward
        
        # Verbose Logging for the USER
        print(f"  [Step {step_num:02d}] Phase: {obs.phase:<8} | Action: {action_str:<8} | Reward: {reward:>5.1f}")
        
        if done:
            print(f"--- Task {task_name} completed in {step_num} steps ---")
            break
            
    return total_reward

def main():
    if not MODEL_NAME:
        print("MODEL_NAME not detected. Please set environment variables.")
        return

    # Initialize OpenAI Client (HF Compatible)
    client = OpenAI(
        base_url=API_BASE_URL,
        api_key=API_KEY
    )

    # Initialize Environment
    try:
        env = BrowserGymEnv()
    except Exception as e:
        print(f"Failed to initialize environment: {e}")
        return
    
    tasks = ["easy", "medium", "hard"]
    scores = {}
    
    # Run all 3 tasks sequentially
    for task_name in tasks:
        try:
            score = run_task(env, client, task_name)
            scores[task_name] = score
            print(f"Task: {task_name} → Score: {score:.1f}")
        except Exception:
            scores[task_name] = 0.0

    # Print Final scores clearly as requested
    total_score = sum(scores.values())
    avg_score = total_score / len(tasks)
    
    print("-" * 20)
    print(f"Total average score: {avg_score:.2f}")

if __name__ == "__main__":
    main()
