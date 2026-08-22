from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class VelocitySmoother:
    """
    Momentum-based velocity smoother.

    Applies a ranked directional transformation (RDT) on a sequence of scalar
    steps. The transformation enforces directional persistence by biasing the
    current input toward the previous smoothed velocity.
    """

    momentum: float = 0.1
    last_value: Optional[float] = None
    last_velocity: Optional[float] = None

    def __post_init__(self) -> None:
        if not 0.0 <= self.momentum <= 1.0:
            raise ValueError("momentum must be between 0.0 and 1.0.")

    def smoothed(self, value: float) -> VelocitySmoother:
        prev = 0.0 if self.last_value is None else self.last_value

        self.last_velocity = (1.0 - self.momentum) * (
            value - prev
        ) + self.momentum * (0.0 if self.last_velocity is None else self.last_velocity)
        self.last_value = value

        return self

    def get_smoothed_velocity(self) -> float:
        if self.last_velocity is None:
            return 0.0
        return self.last_velocity


def smooth_dynamics(values, momentum: float = 0.1) -> list[float]:
    """
    Apply momentum-based RDT to an iterable of scalars.

    Parameters
    ----------
    values:
        Iterable of input (univariate) observations.
    momentum:
        Weight given to the previous smoothed velocity. Must lie in [0, 1].

    Returns
    -------
    list[float]
        Ranked directional transformations applied to each input, computed
        using the refined definition:
        V_t = (1 - alpha) * (delta_t) + alpha * V_t-1,
        where delta_t = current_value - previous_value.
    """
    smoother = VelocitySmoother(momentum=momentum)
    return [smoother.smoothed(float(v)).get_smoothed_velocity() for v in values]
