import random
from server.models import Action, Observation


class OAREEnvironment:
    def __init__(self):
        self.reset()

    def reset(self) -> Observation:
        self._state = {
            "phase": "start",
            "history": []
        }

        # potential memory
        self.prev_phi = 0

        return Observation(
            step=0,
            phase="start",
            market_condition=random.choice([
                "normal",
                "high_demand",
                "api_timeout",
                "logistics_strike"
            ]),
            available_items=[],
            reward_signal=0.0,
            is_terminal=False
        )

    def step(self, action: Action) -> Observation:
        self._state["history"].append(action.command)

        flow = ["search", "select", "init", "confirm"]
        current_phase = self._state["phase"]

        rt = -0.1
        error = None

        # expected next step
        if current_phase == "start":
            expected = "search"
        else:
            idx = flow.index(current_phase)
            expected = flow[idx + 1] if idx + 1 < len(flow) else None

        # transition logic
        if action.command == expected:
            self._state["phase"] = action.command
        else:
            rt -= 500.0
            error = "INVALID_SEQUENCE"

        # chaos simulation
        if self._state["phase"] != "start" and random.random() < 0.3:
            error = "503_SERVICE_UNAVAILABLE"
            rt -= 5.0

        # potential function
        phi_map = {
            "start": 0,
            "search": 10,
            "select": 30,
            "init": 60,
            "confirm": 100
        }

        current_phi = phi_map.get(self._state["phase"], 0)

        reward = (current_phi - self.prev_phi) + rt
        self.prev_phi = current_phi

        done = self._state["phase"] == "confirm"

        return Observation(
            step=len(self._state["history"]),
            phase=self._state["phase"],
            last_error=error,
            market_condition=random.choice([
                "normal",
                "high_demand",
                "api_timeout",
                "logistics_strike"
            ]),
            available_items=[],
            reward_signal=reward,
            is_terminal=done
        )

    @property
    def state(self):
        return self._state