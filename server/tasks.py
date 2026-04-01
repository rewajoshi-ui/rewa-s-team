def grade_easy_happy_path(trajectory):
    """Checks if the agent finished the transaction."""
    final_obs = trajectory[-1]["observation"]
    return 1.0 if final_obs.step == "status" else 0.0

def grade_medium_resilience(trajectory):
    """Checks if the agent persisted through API errors."""
    has_errors = any(t["observation"].error is not None for t in trajectory)
    finished = trajectory[-1]["observation"].step == "status"
    return 1.0 if (has_errors and finished) else (0.5 if finished else 0.0)

def grade_hard_latency_optimization(trajectory):
    """Penalizes agents that waste tokens during high latency."""
    total_steps = len(trajectory)
    finished = trajectory[-1]["observation"].step == "status"
    # Perfect score only if finished in minimum steps (5)
    if finished:
        return max(0.0, 1.0 - (total_steps - 5) * 0.1)
    return 0.0

TASKS = [
    {"id": "happy_path", "grader": grade_easy_happy_path},
    {"id": "chaos_resilience", "grader": grade_medium_resilience},
    {"id": "efficiency_under_stress", "grader": grade_hard_latency_optimization}
]